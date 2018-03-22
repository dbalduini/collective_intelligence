const myData = require('./data.json')
const tree = require('./decision-tree')

// referer, location, read FAQ, pages view, service
const features = myData.features
const target = myData.target

let t = tree.buildTree(features, target)

console.log(tree.classify(t, ['google','US','yes',23]))
console.log(tree.classifyWithMissingData(t, ['google','US','yes',23]))

console.log(tree.classifyWithMissingData(t, ['google',null,'yes',null]))
console.log(tree.classifyWithMissingData(t, ['google','France',null,null]))
