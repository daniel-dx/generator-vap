'use strict';

var _ = require('lodash');
var glob = require("glob");
var path = require('path');
var s = require('underscore.string');
var yeoman = require('yeoman-generator');

var logger = require('../app/logger');
var utils = require('../app/utils');

var scrFolderPath, scrFolder;

module.exports = yeoman.Base.extend({

  prompting() {

    var prompts = [{
      type: 'string',
      name: 'name',
      message: 'What is your component name?',
      require: true
    }];

    return this.prompt(prompts).then(props => {

      this.props = props;

      // example: name = demo-user
      this.props.componentName = s(this.props.name).slugify().value(); // => demo-user
      this.props.camelComponentName = s(this.props.componentName).camelize().value(); // => demoUser
      this.props.firstCapCamelComponentName = s(this.props.camelComponentName).capitalize().value(); // => DemoUser

      scrFolder = 'src/components/' + this.props.componentName;
      scrFolderPath = './' + scrFolder + '/';

    });

  },

  copyTemplates() {

    var done = this.async();

    glob(this.templatePath() + "/**/*.*", {}, (er, files) => {
      _.each(files, filePath => {
        var toFileName = path.parse(filePath).base.replace('_', this.props.componentName);
        this.fs.copyTpl(
          filePath,
          path.resolve(scrFolderPath, toFileName),
          this.props
        );
      });

      done();
    });

  },

  updateContent() {

    var fullPath = 'src/components/App.vue';

    utils.rewriteFile({
      fileRelativePath: fullPath,
      insertPrev: true,
      needle: "<!-- Don't touch me -->",
      splicable: [
        `<${this.props.componentName}></${this.props.componentName}>`
      ]
    });
    utils.rewriteFile({
      fileRelativePath: fullPath,
      insertPrev: true,
      needle: "// Don't touch me - import",
      splicable: [
        `import ${this.props.firstCapCamelComponentName} from './${this.props.componentName}/index.vue'`
      ]
    });
    utils.rewriteFile({
      fileRelativePath: fullPath,
      insertPrev: true,
      needle: "// Don't touch me - component",
      splicable: [
        `${this.props.firstCapCamelComponentName},`
      ]
    });

  },

  usageTip() {
    logger.log('=========================');
    logger.log('Congratulations, completed successfully!');
    logger.log("Gook Luck!");
    logger.log('=========================');
  }

});
