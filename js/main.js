(function() {

  var allWords = (function(rawWordCategories) {
    var rtn = [];
    function wordFactory(category) {
      return function(raw, index) {
        return {
          id: category + ':' + (index + 1),
          category: category,
          index: index + 1,
          yomikata: raw[2],
          title: raw[1],
          translation: raw[0],
          isChecked: false,
          isImportant: false,
          yomikataShown: true,
          translationShown: true,
        };
      };
    }

    for (var category in rawWordCategories) {
      var categoryWords = rawWordCategories[category].map(wordFactory(category));
      rtn = rtn.concat(categoryWords);
    }
    return rtn;
  })(WORDS || {});

  var allCategories = (function(rawWordCategories) {
    return Object.keys(rawWordCategories);
  })(WORDS || {});

  var categoryShown = allCategories.slice(0);

  var PAGE_WORDS_COUNT = 300;

  var initialData = {
    yomikataAllShown: true,
    translationAllShown: true,
    onlyImportant: false,
    alsoChecked: false,
    categoryShown: categoryShown,
    categories: allCategories,
    words: [],
    curPage: 0,
    importantWords: [],
    checkedWords: [],
    randomSeed: 0,
  };

  var app = new Vue({
    el: '.container',
    data: initialData,
    computed: {
      /*words: function() {
        filterWordsByCategories(allWords, this.categoryShown);
      },*/
      categoryFilteredWords: function() {
        var categoryShown = this.categoryShown;
        return this.words.filter(function(word) {
          return categoryShown.indexOf(word.category) >= 0;
        });
      },
      markFilteredWords: function() {
        var onlyImportant = this.onlyImportant;
        var alsoChecked = this.alsoChecked;
        return this.categoryFilteredWords.filter(function(word) {
          if (word.isImportant) {
            return true;
          }
          if (onlyImportant && !word.isImportant) {
            return false;
          }
          if (!alsoChecked && word.isChecked) {
            return false;
          }
          return true;
        });
      },
      pageWords: function() {
        var start = this.curPage * PAGE_WORDS_COUNT;
        var end = start + PAGE_WORDS_COUNT;
        return this.markFilteredWords.slice(start, end);
      },
      totalPages: function() {
        if (!this.words.length) {
          return 0;
        }
        return Math.ceil(this.markFilteredWords.length / PAGE_WORDS_COUNT);
      },
    },
    methods: {
      toggleImportant: function(w) {
        w.isImportant = !w.isImportant;
        if (w.isImportant) {
          if (this.importantWords.indexOf(w.id) < 0) {
            this.importantWords.push(w.id);
          }
        } else {
          if (this.importantWords.indexOf(w.id) >= 0) {
            this.importantWords.splice(this.importantWords.indexOf(w.id), 1);
          }
        }
      },
      toggleChecked: function(w) {
        w.isChecked = !w.isChecked;
        if (w.isChecked) {
          if (this.checkedWords.indexOf(w.id) < 0) {
            this.checkedWords.push(w.id);
          }
        } else {
          if (this.checkedWords.indexOf(w.id) >= 0) {
            this.checkedWords.splice(this.checkedWords.indexOf(w.id), 1);
          }
        }
      },
      toggleYomikata: function(w) {
        w.yomikataShown = !w.yomikataShown;
      },
      toggleTranslation: function(w) {
        w.translationShown = !w.translationShown;
      },
      toggleAllYomikata: function() {
        var allShown = this.yomikataAllShown = !this.yomikataAllShown;
        this.words.forEach(function(word) {
          word.yomikataShown = allShown;
        });
      },
      toggleAllTranslation: function() {
        var allShown = this.translationAllShown = !this.translationAllShown;
        this.words.forEach(function(word) {
          word.translationShown = allShown;
        });
      },
      toggleOnlyImportant: function() {
        this.onlyImportant = !this.onlyImportant;
      },
      toggleAlsoChecked: function() {
        this.alsoChecked = !this.alsoChecked;
      },
      toggleCategory: function(category) {
        var index = this.categoryShown.indexOf(category);
        if (index >= 0) {
          this.categoryShown.splice(index, 1);
        } else {
          this.categoryShown.push(category);
        }
        this.curPage = 0;
      },
      goPage: function(page) {
        this.curPage = page - 1;
      },
      goPrevPage: function() {
        this.curPage = this.curPage - 1;
      },
      goNextPage: function() {
        this.curPage = this.curPage + 1;
      },
      shuffle: function() {
        this.randomSeed = Date.now() + '';
        Math.seedrandom(this.randomSeed);
        var i = this.words.length;
        var j = 0;
        while (i) {
          j = Math.floor(Math.random() * i);
          var word = this.words.splice(j, 1);
          this.words.push(word[0]);
          i--;
        }
      },
    },
  });

  app.words = allWords;

})();
