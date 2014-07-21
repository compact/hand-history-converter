var paths = {
  'html': 'app/index.html',
  'scripts': 'app/scripts/**/*.js',
  'sass': 'app/styles/**/*.scss',
  'sassDir': 'app/styles',
  'css': 'app/.tmp'
};

var compassOptions = { // passed into compass()
  'config_file': 'config.rb',
  'sass': paths.sassDir,
  'css': paths.css
};


// dependencies
var gulp = require('gulp');
var filter = require('gulp-filter');
var rimraf = require('gulp-rimraf');

// dependencies for the server
var connect = require('connect');
var livereload = require('gulp-livereload');

// dependencies for scripts
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

// dependencies for styles
var compass = require('gulp-compass');
var minifyCSS = require('gulp-minify-css');

// dependencies for HTML
var useref = require('gulp-useref');
var cdnizer = require('gulp-cdnizer');
var minifyHTML = require('gulp-minify-html');


// jshint
gulp.task('jshint', function () {
  return gulp.src([paths.scripts, 'gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// compass
var devCompass = function () {
  return gulp.src(paths.sass)
    .pipe(compass(compassOptions));
};
gulp.task('dev-compass', ['build-clean'], devCompass);

// development server, based on https://github.com/vohof/gulp-livereload
gulp.task('dev-server', function (next) {
  var server = connect();
  server.use(connect.static('app/'))
    .use('/test', connect.static('test/'))
    .listen(60001, next); // port
});

// watch
gulp.task('dev-watch', function() {
  var server = livereload();

  gulp.watch('app/**/*.*').on('change', function (file) {
    if (file.path.match(/scss$/)) {
      devCompass();
      server.changed(paths.css + '/main.css');
    } else {
      server.changed(file.path);
    }
  });
});

// run this when developing this project
gulp.task('dev', ['dev-server', 'dev-watch']);

// delete the build dir
gulp.task('build-clean', function() {
  return gulp.src('dist', {
      'read': false  // not reading the files speeds up this task
    })
    .pipe(rimraf());
});

// copy
gulp.task('build-copy', ['build-clean'], function () {
  return gulp.src('app/bower_components/zeroclipboard/dist/ZeroClipboard.swf')
    .pipe(gulp.dest('dist/scripts'));
});

// useref
gulp.task('build-useref', ['build-clean', 'dev-compass'], function () {
  var htmlFilter = filter('**/*.html');
  var scriptsFilter = filter('**/*.js');
  var stylesFilter = filter('**/*.css');

  return gulp.src(paths.html)
    .pipe(useref.assets())
    .pipe(scriptsFilter) // scripts start
    .pipe(uglify())
    .pipe(scriptsFilter.restore()) // scripts end
    .pipe(stylesFilter) // styles start
    .pipe(minifyCSS())
    .pipe(stylesFilter.restore()) // styles end
    .pipe(useref.restore())
    .pipe(htmlFilter) // html start
    .pipe(useref())
    .pipe(cdnizer([
      {
        'package': 'bootstrap',
        'file': '**/bootstrap.css',
        'cdn': '//maxcdn.bootstrapcdn.com/bootstrap/${version}/css/bootstrap.min.css'
      },
      {
        'package': 'jquery',
        'file': '**/jquery.js',
        'cdn': '//ajax.googleapis.com/ajax/libs/jquery/${version}/jquery.min.js'
      }
    ]))
    .pipe(minifyHTML())
    .pipe(htmlFilter.restore()) // html end
    .pipe(gulp.dest('dist'));
});

// build
gulp.task('build', ['build-useref', 'build-copy']);

// build server
gulp.task('build-server', ['build'], function (next) {
  var server = connect();
  server.use(connect.static('dist/')).listen(60002, next);
});
