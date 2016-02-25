import Popup from 'torii/services/popup';
import PopupIdSerializer from 'torii/lib/popup-id-serializer';
import { CURRENT_REQUEST_KEY } from "torii/mixins/ui-service-mixin";
import QUnit from 'qunit';

let { module, test } = QUnit;

var popup;
var originalWindowOpen = window.open;

var buildMockWindow = function(windowName){
  windowName = windowName || "";
  return {
    name: windowName,
    focus: Ember.K,
    close: Ember.K
  };
};

var buildPopupIdGenerator = function(popupId){
  return {
    generate: function(){
      return popupId;
    }
  };
};

var buildMockStorageEvent = function(popupId, redirectUrl){
  return Ember.$.Event('storage', {
    originalEvent: {
      key: PopupIdSerializer.serialize(popupId),
      newValue: redirectUrl
    }
  });
};

module("Popup - Unit", {
  setup: function(){
    popup = Popup.create();
    localStorage.removeItem(CURRENT_REQUEST_KEY);
  },
  teardown: function(){
    localStorage.removeItem(CURRENT_REQUEST_KEY);
    window.open = originalWindowOpen;
    Ember.run(popup, 'destroy');
  }
});

test("open resolves based on popup window", function(assert){
  let done = assert.async();
  assert.expect(8);
  var expectedUrl = 'http://authServer';
  var redirectUrl = "http://localserver?code=fr";
  var popupId = '09123-asdf';
  var mockWindow = null;

  popup = Popup.create({remoteIdGenerator: buildPopupIdGenerator(popupId)});

  window.open = function(url, name){
    assert.ok(true, 'calls window.open');
    assert.equal(url, expectedUrl, 'opens with expected url');

    assert.equal(PopupIdSerializer.serialize(popupId),
        localStorage.getItem(CURRENT_REQUEST_KEY),
        "adds the key to the current request item");

    mockWindow = buildMockWindow(name);
    return mockWindow;
  };

  Ember.run(function(){
    popup.open(expectedUrl, ['code']).then(function(data){
      assert.ok(true, 'resolves promise');
      assert.equal(popupId, PopupIdSerializer.deserialize(mockWindow.name), "sets the window's name properly");
      assert.deepEqual(data, {code: 'fr'}, 'resolves with expected data');
      assert.equal(null,
          localStorage.getItem(CURRENT_REQUEST_KEY),
          "removes the key from local storage");
      assert.equal(null,
          localStorage.getItem(PopupIdSerializer.serialize(popupId)),
          "removes the key from local storage");
    }, function(){
      assert.ok(false, 'rejected the open promise');
    }).finally(done);
  });


  localStorage.setItem(PopupIdSerializer.serialize(popupId), redirectUrl);
  // Need to manually trigger storage event, since it doesn't fire in the current window
  Ember.$(window).trigger(buildMockStorageEvent(popupId, redirectUrl));
});

test("open rejects when window does not open", function(assert){
  let done = assert.async();
  var closedWindow = buildMockWindow();
  closedWindow.closed = true;
  window.open = function(){
    assert.ok(true, 'calls window.open');
    return closedWindow;
  };

  Ember.run(function(){
    popup.open('http://some-url.com', ['code']).then(function(){
      assert.ok(false, 'resolves promise');
    }, function(){
      assert.ok(true, 'rejected the open promise');
    }).finally(done);
  });
});

test("open does not resolve when receiving a storage event for the wrong popup id", function(assert){
  let done = assert.async();

  window.open = function(){
    assert.ok(true, 'calls window.open');
    return buildMockWindow();
  };

  var promise = Ember.run(function(){
    return popup.open('http://someserver.com', ['code']).then(function(){
      assert.ok(false, 'resolves the open promise');
    }, function(){
      assert.ok(false, 'rejected the open promise');
    }).finally(done);
  });

  localStorage.setItem(PopupIdSerializer.serialize("invalid"), "http://authServer");
  // Need to manually trigger storage event, since it doesn't fire in the current window
  Ember.$(window).trigger(buildMockStorageEvent("invalid", "http://authServer"));

  setTimeout(function(){
    assert.ok(!promise.isFulfilled, 'promise is not fulfulled by invalid data');
    assert.deepEqual("http://authServer",
        localStorage.getItem(PopupIdSerializer.serialize("invalid")),
        "doesn't remove the key from local storage");
    done();
  },10);
});

test("open rejects when window closes", function(assert){
  let done = assert.async();

  var mockWindow = buildMockWindow();
  window.open = function(){
    assert.ok(true, 'calls window.open');
    return mockWindow;
  };

  Ember.run(function(){
    popup.open('some-url', ['code']).then(function(){
      assert.ok(false, 'resolved the open promise');
    }, function(){
      assert.ok(true, 'rejected the open promise');
    }).finally(done);
  });

  mockWindow.closed = true;
});
