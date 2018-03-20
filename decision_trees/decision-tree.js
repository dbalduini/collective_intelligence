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

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
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
function getEntropy(target) {
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
  const numRows = features.length
  
  if (numRows === 0) {
    return new Node()
  }

  const nCols = features[0].length
  let bestGain = 0.0
  let bestCriteria = null
  let bestSets = null
  let score = getEntropy(target)

  for (let colIndex = 0; colIndex < nCols; colIndex++) {
    let colValues = new Set()
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      colValues.add(features[rowIndex][colIndex])
    }

    for (let value of colValues) {
      let [truth, falsy] = divideSet(features, colIndex, value)

      let p = truth.length / numRows
      let te = getEntropy(select(target, truth))
      let fe = getEntropy(select(target, falsy))
      // Compute the Information Gain
      let gain = score -p * te - (1-p) * fe

      if (gain > bestGain && truth.length > 0 && falsy.length > 0) {
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
    let node = new Node(countUnique(target))
    return node
  }
}

const colNames = ['referer', 'location', 'read FAQ', 'pages view']

function printTree (tree, indent='') {
  if (tree.results) {
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

module.exports = {
  divideSet,
  getEntropy,
  Node,
  buildTree,
  printTree
}
