(function () {
  var link = document.createElement ('link');
  link.rel = "stylesheet";
  link.href = "test.css";
  document.head.appendChild (link);

  var meta = document.createElement ('viewport');
  meta.name = 'viewport';
  meta.content = "width=device-width";
  document.head.appendChild (meta);

  var qunitLoaded = new Promise (function (ok, error) {
    var script = document.createElement ('script');
    script.src = 'https://code.jquery.com/qunit/qunit-2.2.0.js';
    script.onload = ok;
    script.onerror = error;
    document.body.appendChild (script);
  });

  var scriptLoaded = new Promise (function (ok, error) {
    var script = document.createElement ('script');
    script.src = '../src/unit-number.js';
    script.onload = ok;
    script.onerror = error;
    document.body.appendChild (script);
  });

  var checkElement = function (assert, e) {
    assert.equal (e.innerHTML, e.title, 'content');
    assert.equal (e.getAttribute ('value'), e.getAttribute ('data-value'), 'value=""');
  }; // checkElement

  qunitLoaded.then (function () {
    document.querySelectorAll ('#qunit-fixture > unit-number').forEach (function (e) {
      QUnit.test ("Element #" + e.id, function (assert) {
        scriptLoaded
            .then (() => checkElement (assert, e))
            .then (assert.async ());
      });
    });

    document.querySelectorAll ('test-code').forEach (function (e) {
      QUnit.test (e.getAttribute ('name'), function (assert) {
        var code = new Function (e.textContent);
        var context = {
          waitAndCheck: function (f) {
            return new Promise ((_) => setTimeout (_, 0) )
                .then (() => checkElement (this.assert, f));
          },
        };
        return Promise.resolve ().then (function () {
          context.assert = assert;
          return code.apply (context);
        }).then (assert.async ());
      });
    });
  });

  var div1 = document.createElement ('div');
  div1.id = "for-screenshot";
  div1.style.display = 'none';
  document.body.appendChild (div1);

  var div2 = document.createElement ('div2');
  div2.id = "qunit";
  document.body.appendChild (div2);
}) ();
/*

Per CC0 <https://creativecommons.org/publicdomain/zero/1.0/>, to the
extent possible under law, the author has waived all copyright and
related or neighboring rights to this work.

*/
