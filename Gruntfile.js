function atob(str) {
    if (str) {
        return new Buffer(str, 'base64').toString('binary');
    }
    return null;
}

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-google-cloud');
    grunt.registerTask('deploy',
        'Upload the build files.',
        function() {
            const project = grunt.option('project'), // vooxe-gamedistribution
                bucket = grunt.option('bucket'), // gd-sdk-html5
                folderIn = grunt.option('in'), //
                folderOut = grunt.option('out'); //

            // The key is saved as a system parameter within Team City.
            // The service account key of our google cloud account for uploading to
            // storage is stringified and then encoded as base64 using btoa()
            console.log(grunt.option('key'));
            let keyObj = grunt.option('key');
            let key = JSON.parse(atob(keyObj));
            console.log(key);

            if (project === undefined) {
                grunt.fail.warn('Cannot upload without a project name');
            }

            if (bucket === undefined) {
                grunt.fail.warn('OW DEAR GOD THEY ARE STEALING MAH BUCKET!');
            }

            if (key === undefined || key === null) {
                grunt.fail.warn('Cannot upload without an auth key');
            } else {
                console.log('Key loaded...');
            }

            grunt.config.merge({
                gcs: {
                    options: {
                        credentials: key,
                        project: project,
                        bucket: bucket,
                        gzip: true,
                        metadata: {
                            'surrogate-key': 'gcs',
                        },
                    },
                    dist: {
                        cwd: './',
                        src: ['index.html', 'assets/**', '404.html'],
                        dest: '',
                    },
                },
            });

            console.log('Project: ' + project);
            console.log('Bucket: ' + bucket);

            if (folderIn === undefined && folderOut === undefined) {
                console.log('Deploying: ./lib/ to gs://' + bucket + '/');
            } else {
                if (folderIn !== undefined) {
                    if (folderOut === undefined) {
                        grunt.fail.warn(
                            'No use in specifying "in" without "out"');
                    }
                    console.log('Deploying: ../' + folderIn + ' to gs://' +
                        bucket + '/' + folderOut);
                    grunt.config.set('gcs.dist', {
                        cwd: '../' + folderIn, src: ['**/*'], dest: folderOut,
                    });
                } else if (folderOut !== undefined) {
                    grunt.fail.warn('No use in specifying "out" without "in"');
                }
            }

            grunt.task.run('gcs');
        });
};