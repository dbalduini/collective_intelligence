const myData = require('./data.json')
const tree = require('./decision-tree')

// referer, location, read FAQ, pages view, service
const features = myData.features
const target = myData.target

let t = tree.buildTree(features, target)
