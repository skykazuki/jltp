(function() {

  var rawWordCategories = WORDS || {};

  var PAGE_WORDS_COUNT = 300;

  var LOCAL_STORAGE_KEY = 'JLTP_SETTING';

  function shuffle(randomSeed, array) {
    if (!randomSeed) {
      return;
    }
    Math.seedrandom(randomSeed);
    var i = array.length;
    var j = 0;
    while (i) {
      j = Math.floor(Math.random() * i);
      var word = array.splice(j, 1);
      array.push(word[0]);
      i--;
    }
  }

  function save() {
    var data = [];
    // [
    //  [categoryShown],
    //  [yomikataAllShown, translationAllShown, onlyImportant, alsoChecked],
    //  [importantWords],
    //  [checkedWords],
    //  curPage,
    //  randomSeed,
    // ]
    data[0] = app.categoryShown.slice(0);
    data[1] = [app.yomikataAllShown ? 1 : 0, app.translationAllShown ? 1 : 0, app.onlyImportant ? 1 : 0, app.alsoChecked ? 1 : 0];
    data[2] = app.importantWords.slice(0);
    data[3] = app.checkedWords.slice(0);
    data[4] = app.curPage;
    data[5] = app.randomSeed;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  function load(data) {
    var settingString = localStorage.getItem(LOCAL_STORAGE_KEY);
    var setting = null;
    if (settingString) {
      try {
        setting = JSON.parse(settingString);
      } catch (e) {
        return;
      }
    }
    if (setting && Array.isArray(setting)) {
      if (setting[0] && Array.isArray(setting[0])) {
        data.categoryShown = setting[0];
      }
      if (setting[1] && Array.isArray(setting[1])) {
        data.yomikataAllShown = !!setting[1][0];
        data.translationAllShown = !!setting[1][1];
        data.onlyImportant = !!setting[1][2];
        data.alsoChecked = !!setting[1][3];
      }
      if (setting[2] && Array.isArray(setting[2])) {
        data.importantWords = setting[2];
      }
      if (setting[3] && Array.isArray(setting[3])) {
        data.checkedWords = setting[3];
      }
      if (!isNaN(setting[4])) {
        data.curPage = setting[4];
      }
      if (setting[5]) {
        data.randomSeed = setting[5];
      }
    }
  }

  var initialData = {
    yomikataAllShown: true,
    translationAllShown: true,
    onlyImportant: false,
    alsoChecked: false,
    categoryShown: Object.keys(rawWordCategories),
    categories: Object.keys(rawWordCategories),
    words: [],
    shuffledWords: [],
    curPage: 0,
    importantWords: [],
    checkedWords: [],
    randomSeed: 0,
  };

  load(initialData);

  var app = new Vue({
    el: '.container',
    data: initialData,
    computed: {
      categoryFilteredWords: function() {
        var categoryShown = this.categoryShown;
        return this.shuffledWords.filter(function(word) {
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
        save();
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
        save();
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
        save();
      },
      toggleAllTranslation: function() {
        var allShown = this.translationAllShown = !this.translationAllShown;
        this.words.forEach(function(word) {
          word.translationShown = allShown;
        });
        save();
      },
      toggleOnlyImportant: function() {
        this.onlyImportant = !this.onlyImportant;
        save();
      },
      toggleAlsoChecked: function() {
        this.alsoChecked = !this.alsoChecked;
        save();
      },
      toggleCategory: function(category) {
        var index = this.categoryShown.indexOf(category);
        if (index >= 0) {
          this.categoryShown.splice(index, 1);
        } else {
          this.categoryShown.push(category);
        }
        this.curPage = 0;
        save();
      },
      goPage: function(page) {
        this.curPage = page - 1;
        save();
      },
      goPrevPage: function() {
        this.curPage = this.curPage - 1;
        save();
      },
      goNextPage: function() {
        this.curPage = this.curPage + 1;
        save();
      },
      shuffle: function() {
        var randomSeed = Date.now() + '';
        this.randomSeed = randomSeed;
        this.shuffledWords = this.words.slice(0);
        shuffle(randomSeed, this.shuffledWords);
        save();
      },
      sequence: function() {
        this.randomSeed = 0;
        this.shuffledWords = this.words.slice(0);
        save();
      },
    },
  });

  //app.words = allWords;
  //app.shuffledWords = app.words.slice(0);

  app.words = (function() {
    var rtn = [];
    function wordFactory(category) {
      return function(raw, index) {
        var id = category + ':' + (index + 1);
        return {
          id: id,
          category: category,
          index: index + 1,
          yomikata: raw[2],
          title: raw[1],
          translation: raw[0],
          isChecked: app.checkedWords.indexOf(id) >= 0,
          isImportant: app.importantWords.indexOf(id) >= 0,
          yomikataShown: app.yomikataAllShown,
          translationShown: app.translationAllShown,
        };
      };
    }

    for (var category in rawWordCategories) {
      var categoryWords = rawWordCategories[category].map(wordFactory(category));
      rtn = rtn.concat(categoryWords);
    }
    return rtn;
  })();
  var shuffledWords = app.words.slice(0);
  if (app.randomSeed) {
    shuffle(app.randomSeed, shuffledWords);
  }
  app.shuffledWords = shuffledWords;

})();
