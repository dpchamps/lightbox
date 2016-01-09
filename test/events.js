module('Events Hash', {
  beforeEach: function(){
    lightbox.events.clear();
  }
});
test("The events module exists", function(){
  ok(lightbox.events);
});

test("events.add expects a function", function(assert){
  assert.throws(function(){
      lightbox.events.add({});
    },
    function(e){
     return (e.message === 'Expected type function for handler');
    },
    "Raised error for Object literal");
  assert.throws(function(){
      lightbox.events.add("");
    },
    function(e){
     return (e.message === 'Expected type function for handler');
    },
    "Raised error String literal");
  assert.throws(function(){
      lightbox.events.add([]);
    },
    function(e){
     return (e.message === 'Expected type function for handler');
    },
    "Raised error Array type");
  assert.throws(function(){
      lightbox.events.add(5);
    },
    function(e){
     return (e.message === 'Expected type function for handler');
    },
    "Raised error Number type");
});
test("events.add receives an anonymous function", function(assert){
  var fn = function(){},
      id = lightbox.events.add(fn);
  ok(lightbox.events.idExists(id));
});
test("events.add receives a named function and references it correctly", function(assert){
  var fn = function test(){},
      name = lightbox.events.add(fn);
      ok(lightbox.events.getByName(name));
});

test("events.get references functions correctly", function(assert){
  var aFn = function(){},
      nFn = function test(){},
      aFnRef = lightbox.events.get( lightbox.events.add(aFn) ),
      nFnRef = lightbox.events.get( lightbox.events.add(nFn) );

  assert.equal(aFn, aFnRef, "Anonymous function referenced correctly");
  assert.equal(nFn, nFnRef, "Named function referenced correctly");
});

test("events.remove removes a function, keeps track of remaining functions", function(assert){
  var one = function(){},
      two = function two(){},
      three = function three(){},
      four = function (){},
      refOne = lightbox.events.add(one),
      refTwo = lightbox.events.add(two),
      refThree = lightbox.events.add(three),
      refFour = lightbox.events.add(four);

  assert.equal(two, lightbox.events.remove(refTwo), "remove returns the correct function");
  assert.equal(one, lightbox.events.get(refOne), "the first function added still exists");
  assert.equal(three, lightbox.events.get(refThree), "the third function added still exists");
  assert.equal(four, lightbox.events.get(refFour), "the fourth function added still exists");

  assert.throws(function(){
    lightbox.events.get(refTwo);
  }, function(e){
    return ( e.name === 'Error');
  }, "Raised an error for name that doesn't exist");
});

test("events.remove removes a named function and allows for the addition for another named function of the same name", function(assert){
  var test1 = function getNum(){
        return 1;
      },
      test2 = function getNum(){
        return 2;
      },
      name = lightbox.events.add(test1),
      ref = lightbox.events.get(name);

  assert.strictEqual(1, ref(), "the returned function works as expected");
  lightbox.events.remove(name);
  name = lightbox.events.add(test2);
  ref = lightbox.events.get(name);
  assert.strictEqual('getNum', name, "The function name is correct");
  assert.strictEqual(test2, ref, 'The function body is correct');
  assert.strictEqual(2, ref(), "the newly added function with same name works as expected");
});

