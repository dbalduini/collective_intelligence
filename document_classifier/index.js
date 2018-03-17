const NaiveBayesClassifier = require('./naive-bayes')
const FisherClassifier = require('./fisher-classifier')

function trainSamples(cl) {
  cl.train('Nobody owns the water.','good')
  cl.train('the quick rabbit jumps fences','good')
  cl.train('buy pharmaceuticals now','bad')
  cl.train('make quick money at the online casino','bad')
  cl.train('the quick brown fox jumps','good')
}

console.log('Naive Bayes Classifier')
const cl = new NaiveBayesClassifier()
trainSamples(cl)
console.log('quick rabbit ->', cl.classify('quick rabbit'))
console.log('quick money ->', cl.classify('quick money'))
cl.thresholds['bad'] = 3.0
console.log('quick money ->', cl.classify('quick money'))
for (let i = 0; i < 10; i++) {
  trainSamples(cl)
}
console.log('quick money ->', cl.classify('quick money'))



console.log('Fisher Classifier')
const fisher = new FisherClassifier()
trainSamples(fisher)
console.log(fisher.fisherProbability('quick rabbit','good'))
console.log(fisher.fisherProbability('quick rabbit','bad'))
console.log('quick rabbit ->', fisher.classify('quick rabbit'))
console.log('quick money ->', fisher.classify('quick money'))
fisher.minimums['bad'] = 0.8
console.log('quick money ->', fisher.classify('quick money'))
fisher.minimums['good'] = 0.42
console.log('quick money ->', fisher.classify('quick money'))
