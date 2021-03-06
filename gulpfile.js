var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    notify     = require('gulp-notify'),
    concat     = require('gulp-concat'),
    compass    = require('gulp-compass'),
    connect    = require('gulp-connect'),
    gulpif     = require('gulp-if'),
    uglify     = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify');

// the env var below helps gulp determine whether this is
// the production or dev environment. Sources are later
// declared as arrays in case there are multiple files
var env,
    jsSources,
    outputDir,
    sassSources,
    sassStyle;

env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

jsSources = [
    'components/scripts/mustache.js',
    'components/scripts/script.js'
];

sassSources = ['components/sass/styles.scss'];

gulp.task('compass', function() {
    gulp.src(sassSources)
        .pipe(compass({
            sass: 'components/sass',
            image: outputDir + 'images',
            style: sassStyle
        }))
            .on('error', gutil.log)
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(notify({ message: 'Done with CSS.'}))
        .pipe(connect.reload())
});

gulp.task('connect', function() {
    connect.server({
        root: outputDir,
        livereload: true
    })
});

gulp.task('html', function() {
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload())
});

gulp.task('js', function() {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(notify({ message: 'Done with JavaScript.'}))
        .pipe(connect.reload())
});

gulp.task('json', function() {
  gulp.src('builds/development/js/*.json')
    .pipe(gulpif(env === 'production', jsonminify()))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
    .pipe(connect.reload())
});

gulp.task('watch', function() {
    gulp.watch(jsSources, ['js']);
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch('builds/development/js/*.json', ['json']);
    gulp.watch('components/sass/*.scss', ['compass']);
});

gulp.task('default', ['compass', 'html', 'js', 'json', 'connect', 'watch']);