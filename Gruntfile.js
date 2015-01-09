// (function() {
//   module.exports = function(grunt) {
//     grunt.initConfig({
//       sshconfig: {
//         myserver: {
//           host: 'mickey.io',
//           username: 'poker',
//           agent: process.env.SSH_AUTH_SOCK
//         }
//       },
//       sshexec: {
//         deploy: {
//           command: ['cd /home/poker/pokercast-server', 'git pull origin master', 'npm install', 'forever stop server.js', 'forever start server.js', 'forever list'].join(' && '),
//           options: {
//             config: 'myserver'
//           }
//         }
//       }
//     });
//     grunt.registerTask('default', ['sshexec:deploy']);
//     return grunt.loadNpmTasks('grunt-ssh');
//   };

// }).call(this);