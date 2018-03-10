var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var tsProject = ts.createProject("tsconfig.json");
var concat = require('gulp-concat');
var pump = require('pump');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var gulpSequence = require('gulp-sequence');
const headerComment = require('gulp-header-comment');

gulp.task('ts', function () {
    gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(concat('scheme-designer.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('all', function (cb) {
    gulpSequence('ts', 'compress', cb)
});

gulp.task('compress', function(cb) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    pump([
            gulp.src('dist/scheme-designer.js'),
            rename({suffix: '.min'}),
            uglify(),
            headerComment('https://github.com/NikitchenkoSergey/scheme-designer \
        Generated on ' + (mm + '/' + dd + '/' + yyyy) + '\
        Author: Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>'),
            gulp.dest('dist')
        ],
        cb
    );
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', ['all']);
});


gulp.task('default', ['watch']);
