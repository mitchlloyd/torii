import initializeTorii from '../helpers/initialize-torii';

function startApp(attrs) {
  var App;
  if (!attrs) { attrs = {}; }

  var loadInitializers = attrs.loadInitializers;
  var Router = attrs.Router;

  var attributes = Ember.merge({
    // useful Test defaults
    rootElement: '#ember-testing',
    LOG_ACTIVE_GENERATION:false,
    LOG_VIEW_LOOKUPS: false
  }, attrs); // but you can override;

  var Application = Ember.Application.extend();

  Router = Router || Ember.Router.extend();
  Router.reopen({
    location: 'none'
  });

  Application.Router = Router;

  if (loadInitializers) {
    initializeTorii(Application);
  }

  Ember.run(function(){
    App = Application.create(attributes);
    App.setupForTesting();
    App.injectTestHelpers();
  });

  return App;
}

export default startApp;
