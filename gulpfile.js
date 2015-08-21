var gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload,
  fs = require('fs'),
  file = require('gulp-file'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  htmlreplace = require('gulp-html-replace'),
  react = require('gulp-react'),
  reactTools = require('react-tools');
// Static server
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./src"
    }
  });
});
gulp.task('browser-sync-prod', function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
});
gulp.task('init', function () {
  return gulp.src([
    'node_modules/react/dist/react.js',
    'node_modules/react/dist/JSXTransformer.js'
  ])
    .pipe(gulp.dest('src/lib'));
});
gulp.task('watch', function () {
  gulp.watch('src/index.html').on('change', browserSync.reload);
  gulp.watch('src/js/app.jsx').on('change', browserSync.reload);
  gulp.watch('src/css/main.css').on('change', browserSync.reload);
});
gulp.task('react-tools', function () {
  var str = fs.readFileSync('src/js/app.jsx').toString();
  var output = reactTools.transform(str, 'harmony : false');
  return file('app.min.js', output, {
    src: true
  }).pipe(react())
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
gulp.task('css', function () {
  return gulp.src([
    'src/css/main.css'
  ]).pipe(minifyCss({
    compatibility: 'ie8'
  })).pipe(gulp.dest('dist'));
});
gulp.task('move', function () {
  return gulp.src(['node_modules/react/dist/react.min.js'])
    .pipe(gulp.dest('dist'));
});
gulp.task('replace', function () {
  gulp.src('src/index.html')
    .pipe(htmlreplace({
      'css': 'main.css',
      'js': 'react.min.js',
      'react': 'app.min.js'
    }))
    .pipe(gulp.dest('dist'));
});
gulp.task('prod', ['react-tools', 'move', 'replace', 'css', 'browser-sync-prod']);
gulp.task('default', ['init', 'browser-sync', 'watch']);