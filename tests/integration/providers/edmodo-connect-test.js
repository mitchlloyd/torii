var torii, app;

import startApp from 'test/helpers/start-app';
import lookup from 'test/helpers/lookup';
import configuration from 'torii/configuration';
import QUnit from 'qunit';

const { module, test } = QUnit;

var originalConfiguration = configuration.providers['edmodo-connect'];

var opened, mockPopup;

module('Edmodo Connect - Integration', {
  setup: function(){
    app = startApp({loadInitializers: true});
    mockPopup = {
      open: function(){
        opened = true;
        return Ember.RSVP.resolve({ access_token: 'test' });
      }
    };
    app.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    app.inject('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = lookup(app, "service:torii");
    configuration.providers['edmodo-connect'] = {
      apiKey: 'dummy',
      redirectUri: 'some url'
    };
  },
  teardown: function(){
    opened = false;
    configuration.providers['edmodo-connect'] = originalConfiguration;
    Ember.run(app, 'destroy');
  }
});

test("Opens a popup to Edmodo", function(assert){
  assert.expect(1);
  Ember.run(function(){
    torii.open('edmodo-connect').finally(function(){
      assert.ok(opened, "Popup service is opened");
    });
  });
});
