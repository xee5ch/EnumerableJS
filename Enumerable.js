function Enumerable(dataSource)
{

    if(!dataSource) this.dataSource = [];
    else this.dataSource = dataSource;

    this.comparators = [];

}

Enumerable.From = function(dataSource) {

    var enumerable = new Enumerable();
    enumerable.dataSource = dataSource;

    return enumerable;
};

Enumerable.Range = function(start, finish) {

    var result = new Enumerable(new Array());

    for(var i = start; i < finish; i++) {

        result.dataSource.push(i);
    }

    return result;
};

Enumerable.prototype = {
    dataSource: undefined,
    comparators: undefined,
    First: function(booleanCallback) {

        if(!booleanCallback) {

            booleanCallback = function(value) {
                if(value)
                    return true;
                
                throw  "Your data source is empty";
            };
        }

        var keys = Object.keys(this.dataSource);

        for(var i = 0; i < keys.length; i++) {

            var value = (this.dataSource)? this.dataSource[keys[i]] : null;
            if(booleanCallback(value)) return value;
        }

        throw "No value was found meeting the criteria";
    },
    FirstOrDefault: function(booleanCallback) {

        if(!booleanCallback) {

            booleanCallback = function(value) {
                return true;
            };
        }

        var keys = Object.keys(this.dataSource);

        for(var i = 0; i < keys.length; i++) {

            var value = (this.dataSource)? this.dataSource[keys[i]] : null;
            if(booleanCallback(value)) return value;
        }
        
    },
    ForEach: function(callBack, start, end) {

        var keys = Object.keys(this.dataSource);

        if(!start) start = 0;
        if(!end) end = keys.length;

        for(var i = start; i < end; i++) {

            var key = keys[i];
            callBack(key, this.dataSource[key]);
        }

    },
    Select: function(callBack) {

        var result = new Enumerable();

        var selectFunction = function(idx, elem) {
            var column = callBack(elem);
            result.dataSource.push(column);
        }

        this.ForEach(selectFunction);

        return result;
    },
    SelectMany: function(callBack) {

        var result = new Enumerable();

        var selectManyFunction = function(idx, elem) {
            var column = callBack(elem);
            result.dataSource = result.dataSource.concat(column);
        }

        this.ForEach(selectManyFunction);

        return result;

    },
    Where: function(callBack) {

        var result = new Enumerable();

        var whereFunction = function(idx, elem) {

            if(callBack(elem)) result.dataSource.push(elem);

        };

        this.ForEach(whereFunction);

        return result;

    },
    Skip: function(number) {

        var result = new Enumerable();

        var SkipFunction = function(idx, elem) {
            result.dataSource.push(elem);
        };

        this.ForEach(SkipFunction, number);

        return result;

    },
    Take: function(number) {

        var result = new Enumerable();

        var TakeFunction = function(idx, elem) {
            result.dataSource.push(elem);
        };

        this.ForEach(TakeFunction, 0, number);

        return result;
    },
    TakeWhile: function(callBack) {

        var result = new Enumerable();

        for(var i = 0; i < this.dataSource.length; i++) {

            if(callBack(this.dataSource[i])) result.dataSource.push(this.dataSource[i]);
            else return result;
        }

        return result;

    },
    SkipWhile: function(callBack) {

        var result = new Enumerable();

        for(var i = 0; i < this.dataSource.length; i++) {

            if(!callBack(this.dataSource[i])) {

                result.dataSource = this.dataSource.slice(i, this.dataSource.length);
                return result;
            }
        }

        return result;

    },
    GroupBy: function(keySelector, elementSelector, resultSelector, compareSelector) {

        var result = new Enumerable({});

        var GroupByCallBack = function(idx, elem) {

            var key = keySelector(elem);

            if(compareSelector) key = compareSelector(key);

            if(elementSelector) elem = elementSelector(elem);

            if(!result.dataSource[key]) result.dataSource[key] = [];

            result.dataSource[key].push(elem);

        };

        this.ForEach(GroupByCallBack);

        if(resultSelector) {

            var dataSource = [];
            var resultFunction = function(key, value) {

                dataSource.push(resultSelector(key, new Enumerable(value)));
                
            };

            result.ForEach(resultFunction);

            result.dataSource = dataSource;
        }

        return result;

    },
    OrderBy: function(keySelector, comparer) {

        var firstSelection = keySelector(this.First());

        if(!comparer && !isNaN(firstSelection)) {

            comparer = function(a, b) {

                return a - b;
            };
        }

        if(!keySelector) {

            keySelector = function(data) {

                return data;
            };
        }

        var sortFunction = function(a, b) {

            var keyA = keySelector(a);
            var keyB = keySelector(b);

            return comparer(keyA, keyB);

        };

        this.dataSource.sort(sortFunction);


        this.comparators.push({ comparer: comparer, keySelector: keySelector });

        return this;


    },
    ThenBy: function(keySelector, comparer) {

        var that = this;
        var firstSelection = keySelector(this.First());

        if(!comparer && !isNaN(firstSelection)) {

            comparer = function(a, b) {

                return a - b;
            };
        }

        if(!keySelector) {

            keySelector = function(data) {

                return data;
            };
        }

        this.comparators.push({ comparer: comparer, keySelector: keySelector });

        var consequtiveComparisons = function(a, b) {

            for(var i = 0; i < that.comparators.length; i++) {

                var compareFunc = that.comparators[i].comparer;
                var keySelector = that.comparators[i].keySelector;
                var keyA = keySelector(a);
                var keyB = keySelector(b);

                var value = compareFunc(keyA, keyB);

                if(value != 0) return value;
            }

            return 0;

        };

        this.dataSource.sort(consequtiveComparisons);

        return this;
    },
    OrderByDescending: function(keySelector, comparer) {

        var firstSelection = keySelector(this.First());

        if(!comparer && !isNaN(firstSelection)) {

            comparer = function(a, b) {

                return b - a;
            };
        }
        else if(!comparer) {

            comparer = function(a, b) {

                return b >= a;
            };
        }

        if(!keySelector) {

            keySelector = function(data) {

                return data;
            };
        }

        return this.OrderBy(keySelector, comparer);

    },
    ThenByDescending: function(keySelector, comparer) {

        var firstSelection = keySelector(this.First());

        if(!comparer && !isNaN(firstSelection)) {

            comparer = function(a, b) {

                return b - a;
            };
        }
        else if(!comparer) {

            comparer = function(a, b) {

                return b >= a;
            };
        }

        if(!keySelector) {

            keySelector = function(data) {

                return data;
            };
        }

        return this.ThenBy(keySelector, comparer);

    },
    Join: function(inner, outerKeySelector, innerKeySelector, resultSelector, compareSelector) {

        var result = new Enumerable();
        var comparer = {};
        
        if(inner instanceof Enumerable == false) inner  = new Enumerable(inner);

        var innerForEach = function(idx, elem) {

            var innerKey = innerKeySelector(elem);

            if(!comparer[innerKey]) comparer[innerKey] = [];

            comparer[innerKey].push(elem);
        };

        inner.ForEach(innerForEach);

        var outerForEach = function(idx, elem) {

            var outerKey = outerKeySelector(elem);
            var innerElemList = comparer[outerKey];

            if(innerElemList) {

                for(var i = 0; i < innerElemList.length; i++) {

                    result.dataSource.push(resultSelector(elem, innerElemList[i]));
                }
            }
        }

        this.ForEach(outerForEach);

        return result;
        
    },
    GroupJoin: function(inner, outerKeySelector, innerKeySelector, resultSelector, compareSelector) {

        var result = new Enumerable();
        var comparer = {};
        
        if(inner instanceof Enumerable == false) inner = new Enumerable(inner);

        var innerForEach = function(idx, elem) {

            var innerKey = innerKeySelector(elem);

            if(!comparer[innerKey]) comparer[innerKey] = [];

            comparer[innerKey].push(elem);
        };

        inner.ForEach(innerForEach);

        var outerForEach = function(idx, elem) {

            var outerKey = outerKeySelector(elem);
            var innerElemList = comparer[outerKey];

            if(innerElemList) {

                result.dataSource.push(resultSelector(elem, innerElemList));
            }
        }

        this.ForEach(outerForEach);

        return result;


    },
    Count: function() {

        if(!this.dataSource) throw "The enumerable is empty";
        return Object.keys(this.dataSource).length;
    },
    ToArray: function() {

        if(Array.isArray(this.dataSource)) return this.dataSource;

        var result = [];

        var ToArrayFunction = function(idx, elem) {

            result.push(elem);
        };

        this.ForEach(ToArrayFunction);

        return result;
    }

};

Enumerable.prototype.constructor = Enumerable;