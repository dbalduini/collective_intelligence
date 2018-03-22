function setup() {
  createCanvas(800, 600)
}

function draw() {
  background(255)
  drawTree()
}

function drawTree() {
  // tree must be a global variable
  let w = getWidth(tree) * 100
  let h = getDepth(tree) * 100 + 120

  drawNode(tree, w / 2, 30)
}

function drawNode(node, x ,y) {
  // is leaf
  if (node.results) {
    let txt = ''

    for (let [k, v] of Object.entries(node.results)) {
      txt += k + ':' + v + '\n'
    }

    textSize(12)
    text(txt, x-20, y)

  } else {
    let w1 = getWidth(node.left) * 60
    let w2 = getWidth(node.right) * 60

    let right = x - (w1 + w2) / 2
    let left = x + (w1 + w2) / 2
    
    textSize(12)
    text(node.col + ':' + node.value, x - 20, y - 10)

    stroke(175)
    line(x, y, right+w1/2, y+100)
    line(x, y, left-w2/2, y+100)

    drawNode(node.left, left -w2 / 2, y + 100)
    drawNode(node.right, right + w1 / 2, y + 100)
  }
}

function getWidth(tree) {
  if (!tree.left && !tree.right) {
    return 1
  }
  return getWidth(tree.left) + getWidth(tree.right)
}

function getDepth(tree) {
  if (!tree.left && !tree.right) {
    return 0
  }
  return Math.max(getDepth(tree.left), getDepth(tree.right)) + 1
}
