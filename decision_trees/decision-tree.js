const colNames = ['referer', 'location', 'read FAQ', 'pages view']
const sum = xs => xs.reduce((acc, i) => acc + i, 0)
const isNumber = n => !isNaN(parseFloat(n)) && isFinite(n)

class Node {
  constructor(results, col=-1, value, left, right) {
    this.col = col
    this.value = value
    // left is the true branch node
    this.left = left
    // right is the false branch node
    this.right = right
    // only leaf branches has the results
    this.results = results
  }
  isBranch() {
    return this.results == null
  }
  isLeaf() {
    return !this.isBranch()
  }
  getNextBranch(value) {
    let branch = null
    if (isNumber(value)) { 
      if (value >= this.value) {
        branch = this.left
      } else {
        branch = this.right
      }
    } else {
      if (value === this.value) {
        branch = this.left
      } else {
        branch = this.right
      }
    }
    return branch
  }
}

// Return the row indexes that divides the set
function divideSet (rows, col, value) {
  let splitter = null
  if (isNumber(value)) {
    splitter = row => row[col] >= value
  } else {
    splitter = row => row[col] === value
  }
  return partition(rows, splitter)
}

function partition(items, func) {
  let truth = []
  let falsy = []

  for (let i = 0; i < items.length; i++) {
    if (func(items[i])) {
      truth.push(i)
    } else {
      falsy.push(i)
    }
  }

  return [truth, falsy]
}

// Entropy, in information theory, is the amount of disorder in a set.
// Basically, how mixed a set is.
function entropy(target) {
  let n = target.length
  let results = countUnique(target)
  let e = 0.0
  for (let r in results) {
    // p is the frequency of the outcome k
    let p = results[r] / n
    e = e - p * Math.log2(p)
  }
  return e
}

function countUnique(target) {
  return target.reduce((acc, r) => {
    if (!acc[r]) {
      acc[r] = 0
    }
    acc[r]++
    return acc
  }, {})
}

function buildTree (features, target) {
  let numRows = features.length
  
  if (numRows === 0) {
    return new Node()
  }

  let nCols = features[0].length
  let bestGain = 0.0
  let bestCriteria = null
  let bestSets = null
  let score = entropy(target)

  for (let colIndex = 0; colIndex < nCols; colIndex++) {
    let colValues = new Set()
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      colValues.add(features[rowIndex][colIndex])
    }

    for (let value of colValues) {
      let [truth, falsy] = divideSet(features, colIndex, value)

      if (truth.length === 0 || falsy.length === 0) {
        continue
      }

      let p = truth.length / numRows
      let te = entropy(select(target, truth))
      let fe = entropy(select(target, falsy))

      // Compute the Information Gain
      let gain = score -p * te - (1-p) * fe

      if (gain > bestGain) {
        bestGain = gain
        bestCriteria = [colIndex, value]
        bestSets = [select(features, truth), 
                    select(features, falsy),
                    select(target, truth),
                    select(target, falsy)]
      }
    }
  }

  if (bestGain > 0) {
    let left = buildTree(bestSets[0], bestSets[2])
    let right = buildTree(bestSets[1], bestSets[3])
    return new Node(null, bestCriteria[0], bestCriteria[1], left, right)
  } else {
    return new Node(countUnique(target))
  }
}

function classify(tree, observation) {
  if (tree.isLeaf()) {
    return tree.results
  }

  let value = observation[tree.col]
  let branch = tree.getNextBranch(value)
  return classify(branch, observation)
}

function printTree (tree, indent='') {
  if (tree.isLeaf()) {
    console.log(indent, tree.results)
  } else {
    // print the criteria
    console.log(indent + colNames[tree.col] + ' : ' + tree.value + ' ?')
    // print the branches
    console.log(indent + 'T->')
    printTree(tree.left, indent + ' ')
    console.log(indent + 'F->')
    printTree(tree.right, indent + ' ')
  }
}

function select (list, indices) {
  return indices.reduce((acc, i) => {
    acc.push(list[i])
    return acc
  }, [])
}

function prune (tree, minGain) {
  if (tree.left.isBranch()){
    prune(tree.left, minGain)
  }
  if (tree.right.isBranch()) {
    prune(tree.right, minGain)
  }

  if (tree.left.isLeaf() && tree.right.isLeaf()) {
    // combine them
    let tb = combineResults(tree.left.results)
    let fb = combineResults(tree.right.results)
    let cb = tb.concat(fb)

    // test reduction in entropy
    let delta = entropy(cb) - (entropy(tb) + entropy(fb) / 2)

    if (delta < minGain) {
      // remove leaves
      tree.left = null
      tree.right = null
      // move combined results to parent node
      tree.results = countUnique(cb)
    }
  }
}

function combineResults(results) {
  let c = []
  for (let [target, count] of Object.entries(results)) {
    c = c.concat(Array(count).fill(target))
  }
  return c
}

function classifyWithMissingData(tree, observation) {
  if (tree.isLeaf()) {
    return tree.results
  }

  let value = observation[tree.col]

  if (value === null || value === undefined) {
    // results
    let tr = classifyWithMissingData(tree.left, observation)
    let fr = classifyWithMissingData(tree.right, observation)
    // counts
    let tc = sum(Object.values(tr))
    let fc = sum(Object.values(fr))
    // weigths
    let tw = tc / (tc + fc)
    let fw = fc / (tc + fc)

    let result = {}

    // In the first loop, the keys are unique, so it is not necessary
    // to set the map default value.
    for (let [target, count] of Object.entries(tr)) {
      result[target] = count * tw
    }

    for (let [target, count] of Object.entries(fr)) {
      if (!result[target]) {
        result[target] = 0
      }
      result[target] += count * fw
    }

    return result
  } else {
    let branch = tree.getNextBranch(value)
    return classifyWithMissingData(branch, observation)
  }
}

module.exports = {
  divideSet,
  entropy,
  Node,
  buildTree,
  printTree,
  classify,
  classifyWithMissingData,
  prune
}
