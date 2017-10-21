(function () {
  var texts = {
    "lat.plus": "N",
    "lat.minus": "S",
    "lon.plus": "E",
    "lon.minus": "W",
    "duration.h": "h",
    "duration.m": "m",
    "duration.s": "s",
  };

  var mpf = 0.3048; // meter = 1 international foot
  var fpml = 5280; // feet = 1 mile

  var useIUnits = false;
  if (document.documentElement) {
    useIUnits = document.documentElement.getAttribute ('data-distance-unit') === 'imperial';
    new MutationObserver (function (mutations) {
      useIUnits = document.documentElement.getAttribute ('data-distance-unit') === 'imperial';
      document.querySelectorAll ('unit-number[type=distance]').forEach (update);
    }).observe (document.documentElement, {attributeFilter: ['data-distance-unit']});
  }
  
  var update = function (e) {
    var value = parseFloat (e.getAttribute ('value'));
    if (!Number.isFinite (value)) return;
    var type = e.getAttribute ('type');
    var unit = null;
    var separator = '';
    if (type === 'distance') {
      unit = 'm';
      if (useIUnits) {
        if (value >= 10 * fpml * mpf) {
          value = Math.floor (value / mpf / fpml);
          unit = 'ml';
        } else {
          value = Math.floor (value / mpf);
          unit = 'ft';
        }
      } else {
        if (value >= 10000) {
          value = Math.floor (value / 100) / 10;
          unit = 'km';
        } else if (value >= 100) {
          value = Math.floor (value);
        } else {
          value = Math.floor (value * 100) / 100;
        }
      }
    } else if (type === 'count' || type === 'rank') {
      // XXX plural rules
      unit = e.getAttribute ('unit') || '';
      if (/^[A-Za-z]/.test (unit)) separator = ' ';
    } else if (type === 'percentage') {
      unit = '%';
      value = Math.round (value * 100 * 10) / 10;
    } else if (type === 'duration') {
      e.textContent = '';
      var s = Math.floor (value % 60);
      value = Math.floor (value / 60);
      var m = value % 60;
      value = Math.floor (value / 60);
      var h = value % 60;
      if (h) {
        e.appendChild (document.createElement ('number-unit')).textContent = texts["duration.h"];
      }
      if (h || m) {
        e.appendChild (document.createElement ('number-value')).textContent = m;
        e.appendChild (document.createElement ('number-unit')).textContent = texts["duration.m"];
      }
      e.appendChild (document.createElement ('number-value')).textContent = s;
      e.appendChild (document.createElement ('number-unit')).textContent = texts["duration.s"];
      e.removeAttribute ('hasseparator');
      return;
    } else if (type === 'bytes') {
      unit = 'B';
      if (value > 1000) {
        value = Math.round (value / 1024 * 10) / 10;
        unit = 'KB';
        if (value > 1000) {
          value = Math.round (value / 1024 * 10) / 10;
          unit = 'MB';
          if (value > 1000) {
            value = Math.round (value / 1024 * 10) / 10;
            unit = 'GB';
          }
        }
      }
    } else if (type === 'lat' || type === 'lon') {
      var sign = value >= 0;
      if (!sign) value = -value;
      var v = Math.floor (value);
      value = (value % 1) * 60;
      var w = Math.floor (value);
      value = (value % 1) * 60;
      var x = Math.floor (value);

      e.innerHTML = "<number-value></number-value><number-unit>\u00B0</number-unit><number-value></number-value><number-unit>\u2032</number-unit><number-value></number-value><number-unit>\u2033</number-unit><number-sign></number-sign>";
      e.children[0].textContent = v;
      e.children[2].textContent = w;
      e.children[4].textContent = x;
      e.children[6].textContent = texts[type + (sign ? ".plus" : ".minus")];
      e.removeAttribute ('hasseparator');
      return;
    } else if (type === 'pixels') {
      value = Math.ceil (value * 10) / 10;
      unit = 'px';
    }
    if (unit === '') {
      e.innerHTML = '<number-value></number-value>';
      e.firstChild.textContent = value.toLocaleString ();
      e.removeAttribute ('hasseparator');
    } else if (unit !== null) {
      e.innerHTML = '<number-value></number-value><number-unit></number-unit>';
      e.firstChild.textContent = value.toLocaleString ();
      e.lastChild.textContent = unit;
      e.insertBefore (document.createTextNode (separator), e.lastChild);
      if (separator.length) {
        e.setAttribute ('hasseparator', '');
      } else {
        e.removeAttribute ('hasseparator');
      }
    }
  }; // update

  var upgrade = function (e) {
    if (e.unitNumberUpgraded) return;
    e.unitNumberUpgraded = true;
    var mo = new MutationObserver (function (mutations) {
      update (mutations[0].target);
    });
    mo.observe (e, {attributeFilter: ['value', 'type']});
    Promise.resolve (e).then (update);
  }; // upgrade
  
  var op = upgrade;
  var selector = 'unit-number';
  var mo = new MutationObserver (function (mutations) {
    mutations.forEach (function (m) {
      Array.prototype.forEach.call (m.addedNodes, function (e) {
        if (e.nodeType === e.ELEMENT_NODE) {
          if (e.matches && e.matches (selector)) op (e);
          Array.prototype.forEach.call (e.querySelectorAll (selector), op);
        }
      });
    });
  });
  mo.observe (document, {childList: true, subtree: true});
  Array.prototype.forEach.call (document.querySelectorAll (selector), op);

  // Integration with <https://github.com/wakaba/html-page-components>
  if (!self.pcFillType) self.pcFillType = {};
  self.pcFillType["unit-number"] = 'contentattribute';
}) ();

/*

Copyright 2017 Wakaba <wakaba@suikawiki.org>.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Affero General Public License for more details.

You does not have received a copy of the GNU Affero General Public
License along with this program, see <https://www.gnu.org/licenses/>.

*/
