module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: "\n\n"
      },
      dist: {
        src: [
          'src/head.js',
          'src/namespace.js',
          'src/util.js',
          'src/events.js',
          'src/imgCache.js',
          'src/tail.js'
        ],
        dest: 'dist/<%= pkg.name.replace(".js", "") %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name.replace(".js", "") %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name.replace(".js", "") %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    qunit: {
      files: ['test/*.html']
    },

    jshint: {
      files: ['src/modules/*.js', 'src/*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        },
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      files: [
        'src/head.js',
        'src/namespace.js',
        'src/util.js',
        'src/events.js',
        'src/imgCache.js',
        'src/tail.js',
        'demo/index.html'
      ],
      tasks: ['concat', 'jshint', 'qunit']
    },

    browserify: {
      'dist/<%= pkg.name.replace(".js", "") %>.js': 'src/main.js'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('test', ['jshint', 'qunit']);
  //grunt.registerTask('serve', ['build', 'watch']);
  //grunt.registerTask('build', ['concat', 'jshint', 'qunit', 'uglify']);
  grunt.registerTask('build', ['browserify','jshint', 'qunit', 'uglify']);


};
