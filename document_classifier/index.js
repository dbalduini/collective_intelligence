const NaiveBayesClassifier = require('./naive-bayes')

function trainSamples(cl) {
  cl.train('Nobody owns the water.','good')
  cl.train('the quick rabbit jumps fences','good')
  cl.train('buy pharmaceuticals now','bad')
  cl.train('make quick money at the online casino','bad')
  cl.train('the quick brown fox jumps','good')
}

const cl = new NaiveBayesClassifier()
trainSamples(cl)

console.log(cl.classify('quick rabbit'))
console.log(cl.classify('quick money'))

cl.thresholds['bad'] = 3.0
console.log(cl.classify('quick money'))

for (let i = 0; i < 10; i++) {
  trainSamples(cl)
}

console.log(cl.classify('quick money'))
