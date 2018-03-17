// A classifier needs features to use for classifying different items.
// Item    -> Document
// Feature -> Word
class Classifier {
  constructor() {
    // Word per Category map
    this.wordCount = {}
    // Category map
    this.categoryCount = {}
  }

  train(doc, cat) {
    let words = this.getFeatures(doc)

    for (let word of words) {
      this.incWord(word, cat)
    }

    this.incCategory(cat)
  }

  countWord(word, cat) {
    if (this.wordCount[word] && this.wordCount[word][cat]) {
      return this.wordCount[word][cat]
    }
    return 0
  }

  countCategory(cat) {
    return this.categoryCount[cat] ? this.categoryCount[cat] : 0
  }

  incCategory(cat) {
    if (!this.categoryCount[cat]) {
      this.categoryCount[cat] = 0.0
    }
    this.categoryCount[cat]++
  }

  incWord(word, cat) {
    if (!this.wordCount[word]) {
      this.wordCount[word] = {}
    }
    if (!this.wordCount[word][cat]) {
      this.wordCount[word][cat] = 0.0
    }
    this.wordCount[word][cat]++
  }

  // Return the conditional probabilty of word given the category
  // P(A | B)
  // P(word | category)
  getWordProbGivenCategory(word, cat) {
    let cc = this.countCategory(cat)
    if (cc === 0) {
      return 0.0
    }
    // The total number of times this word appeared in this
    // category divided by the total number of items in this category
    return this.countWord(word, cat) / cc
  }

  // The more a word appears, the more it gets pulled further 
  // from their assumed probabilty.
  getWeightedProb(word, cat) {
    const ap = 0.5 // The assumed probabilty
    const w = 1.0 // The weight
    let p = this.getWordProbGivenCategory(word, cat)
    let total = this.getTotalWordCount(word)
    return ((w * ap) + (total * p)) / (w + total)
  }

  getCategories() {
    return Object.keys(this.categoryCount)
  }

  getTotalWordCount(word) {
    let sum = 0
    for (let cat of this.getCategories()) {
      sum += this.countWord(word, cat)
    }
    return sum
  }

  getTotalItemsCount() {
    const sum = (acc, cat) => this.countCategory(cat) + acc
    return this.getCategories().reduce(sum, 0)
  }

  getFeatures (doc) {
    return doc.toLowerCase().split(/\W+/)
  }
}

module.exports = Classifier
