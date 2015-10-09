var torii, app;

import configuration from 'torii/configuration';
import MockPopup from 'test/helpers/mock-popup';
import startApp from 'test/helpers/start-app';
import lookup from 'test/helpers/lookup';
import QUnit from 'qunit';

const { module, test } = QUnit;

var originalConfiguration = configuration.providers['linked-in-oauth2'];

var mockPopup = new MockPopup();

var failPopup = new MockPopup({ state: 'invalid-state' });

module('Linked In - Integration', {
  setup: function(){
    app = startApp({loadInitializers: true});
    app.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    app.register('torii-service:fail-popup', failPopup, {instantiate: false});
    app.inject('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = lookup(app, "service:torii");
    configuration.providers['linked-in-oauth2'] = {apiKey: 'dummy'};
  },
  teardown: function(){
    mockPopup.opened = false;
    configuration.providers['linked-in-oauth2'] = originalConfiguration;
    Ember.run(app, 'destroy');
  }
});

test("Opens a popup to Linked In", function(assert){
  Ember.run(function(){
    torii.open('linked-in-oauth2').finally(function(){
      assert.ok(mockPopup.opened, "Popup service is opened");
    });
  });
});

test('Validates the state parameter in the response', function(assert){
  app.inject('torii-provider', 'popup', 'torii-service:fail-popup');

  Ember.run(function(){
    torii.open('linked-in-oauth2').then(null, function(e){
      assert.ok(/has an incorrect session state/.test(e.message),
         'authentication fails due to invalid session state response');
    });
  });
});
