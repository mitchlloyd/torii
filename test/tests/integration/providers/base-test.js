import configuration from 'torii/configuration';
import BaseProvider from 'torii/providers/base';
import PopupService from 'torii/services/popup';
import IframeService from 'torii/services/iframe';
import startApp from '../helpers/start-app';
import configuration from 'torii/configuration';
import lookup from '../helpers/lookup';

var ProviderSubclass = BaseProvider.extend({
  name: 'base-subclass-name'
});

var app;

module('Integration - BaseProvider', {
  setup: function(){
    app = startApp({loadInitializers: true});
    app.register('torii-provider:base-subclass', ProviderSubclass);
  },

  teardown: function() {
    Ember.run(app, 'destroy');
    delete configuration.remoteServiceName;
    delete configuration.providers['base-subclass-name'];
  }
});

test("default popup is a PopupService", function() {
  var provider = lookup(app, 'torii-provider:base-subclass');
  ok(provider.get('popup') instanceof PopupService, 'Popup service is popup');
});

test("configured default popup", function() {
  configuration.remoteServiceName = 'iframe';
  var provider = lookup(app, 'torii-provider:base-subclass');
  ok(provider.get('popup') instanceof IframeService, 'Popup service is iframe');
});

test("configured popup on providers", function() {
  configuration.providers['base-subclass-name'] = {
    remoteServiceName: 'iframe'
  };
  var provider = lookup(app, 'torii-provider:base-subclass');
  ok(provider.get('popup') instanceof IframeService, 'Popup service is iframe');
});
