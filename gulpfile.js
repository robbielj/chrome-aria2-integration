var del = require('del');
var gulp = require('gulp');
var htmlMinify = require('gulp-html-minifier');
var jsonMinify = require('gulp-json-minify');
var watch = require('gulp-watch');
var path = require('path');
var webpack = require('webpack');
var webpackConfig = require(path.join(__dirname, 'webpack.config.js'));

var htmlMinifyConfig = {
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    minifyCSS: true,
    sortAttributes: true,
    sortClassNames: true
};

///
// Base
///

gulp.task('webpack', function (done) {
    webpack(webpackConfig).run(done);
});

gulp.task('clean', function () {
    return del('dist');
});

var assets = function () {
    return gulp.src('src/icons/*')
        .pipe(gulp.dest('dist/chrome/icons'))
        .pipe(gulp.dest('dist/safari.safariextension/icons'));
};

var vendor = function () {
    return gulp.src('dist/vendor.js')
        .pipe(gulp.dest('dist/chrome/js'))
        .pipe(gulp.dest('dist/safari.safariextension/js')) &&
        del('dist/vendor.js');
};

var base = gulp.series('webpack', gulp.parallel(assets, vendor));

///
// Chrome
/// 

var chromeManifest = function () {
    return gulp.src('src/chrome/manifest.json')
        .pipe(jsonMinify())
        .pipe(gulp.dest('dist/chrome'));
};

var chromeHtml = function () {
    return gulp.src('src/chrome/**/*.html')
        .pipe(htmlMinify(htmlMinifyConfig))
        .pipe(gulp.dest('dist/chrome'));
};

var chromeLocales = function () {
    return gulp.src('src/_locales/**/*.json')
        .pipe(jsonMinify())
        .pipe(gulp.dest('dist/chrome/_locales'));
};

gulp.task('chrome:watch', function () {
    gulp.parallel(base, chrome)();
    return watch(
        ['src/chrome', 'src/_locales', 'src/downloader', 'src/icons'],
        {},
        gulp.parallel(base, chrome));
});

var chrome = gulp.parallel(chromeManifest, chromeHtml, chromeLocales)
gulp.task('chrome', gulp.series('clean', base, chrome));

///
// Safari
///

var safariPlist = function () {
    return gulp.src([
        'src/safari/Info.plist',
        'src/safari/Settings.plist'
    ]).pipe(gulp.dest('dist/safari.safariextension'));
};

var safariHtml = function () {
    return gulp.src('src/safari/**/*.html')
        .pipe(htmlMinify(htmlMinifyConfig))
        .pipe(gulp.dest('dist/safari.safariextension'));
};

gulp.task('safari:watch', function () {
    gulp.parallel(base, safari)();
    return watch(
        ['src/safari', 'src/_locales', 'src/downloader', 'src/icons'],
        {},
        gulp.parallel(base, safari));
});

var safari = gulp.parallel(safariPlist, safariHtml);
gulp.task('safari', gulp.series('clean', base, safari));

gulp.task('default', gulp.series('clean', base, gulp.parallel(chrome, safari)));
