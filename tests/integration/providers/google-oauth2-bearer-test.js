var torii, app;

import configuration from 'torii/configuration';
import startApp from 'test/helpers/start-app';
import lookup from 'test/helpers/lookup';
import QUnit from 'qunit';

const { module, test } = QUnit;

var originalConfiguration = configuration.providers['google-oauth2-bearer'];

var opened, mockPopup;

module('Google Bearer- Integration', {
  setup: function(){
    mockPopup = {
      open: function(){
        opened = true;
        return Ember.RSVP.resolve({ access_token: 'test' });
      }
    };
    app = startApp({loadInitializers: true});
    app.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    app.inject('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = lookup(app, "service:torii");
    configuration.providers['google-oauth2-bearer'] = {apiKey: 'dummy'};
  },
  teardown: function(){
    opened = false;
    configuration.providers['google-oauth2-bearer'] = originalConfiguration;
    Ember.run(app, 'destroy');
  }
});

test("Opens a popup to Google", function(assert){
  assert.expect(1);
  Ember.run(function(){
    torii.open('google-oauth2-bearer').finally(function(){
      assert.ok(opened, "Popup service is opened");
    });
  });
});

test("Opens a popup to Google with request_visible_actions", function(assert){
  assert.expect(1);
  configuration.providers['google-oauth2-bearer'].requestVisibleActions = "http://some-url.com";
  mockPopup.open = function(url){
    assert.ok(
      url.indexOf("request_visible_actions=http%3A%2F%2Fsome-url.com") > -1,
      "request_visible_actions is present" );
    return Ember.RSVP.resolve({ access_token: 'test' });
  };
  Ember.run(function(){
    torii.open('google-oauth2-bearer');
  });
});
