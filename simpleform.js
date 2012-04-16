/* TODO
 * What's the compatibility story for textContent and setAttribute?
 */

function Builder (model, options) {
  this.model = model;
  this.modelClass = options.modelClass || model.constructor.name;
  this.form = document.createElement("form");
  this.elements = {};
  this.containerId = options.containerId || this.modelClass.toLowerCase() + "-container";
  this.container = document.getElementById(this.containerId);
  this.labelGenerator = options.labelGenerator;

  if (this.isNewRecord()) {
    this.form.action = pluralizeString(this.modelClass.toLowerCase());
  } else {
    this.form.action = this.modelClass.toLowerCase() + "/" + model.id + "/update";
    this.input("id", "hidden", {});
  }

  if (options.html) setAttributesOnEl(this.form, options.html);
};

Builder.prototype.input = function (name, type, options) {
  var label,
      input = document.createElement("input"),
      id = this.modelClass.toLowerCase() + "_" + name.toLowerCase().replace(/\s+/g,"_");

  input.id = id;
  input.type = type;

  if (this.model[name]) input.value = this.model[name];

  if (options.html) setAttributesOnEl(input, options.html);
  if (options.showLabel) {
    label = document.createElement("label");
    if (this.labelGenerator) {
      label.textContent = this.labelGenerator(name, options.required, prettyLabel(name));
    } else {
      label.textContent = prettyLabel(name) + (options.required ? "*" : "");
    }
    label.htmlFor = id;

    this.form.appendChild(label);
  }

  this.elements[name] = input;
  this.form.appendChild(input);
}

Builder.prototype.string = function (name, options) {
  options = extend({showLabel: true}, options);
  this.input(name, "text", options);
};

Builder.prototype.password = function (name, options) {
  options = extend({showLabel: true}, options);
  this.input(name, "password", options);
};

Builder.prototype.checkbox = function (name, options) {
  options = extend({showLabel: true}, options);
  this.input(name, "checkbox", options);
  this.elements[name].checked = this.model[name] ? "checked" : "";
};

Builder.prototype.select = function (name, items, options) {
  var label,
      option,
      i,
      select = document.createElement("select"),
      id = this.modelClass.toLowerCase() + "_" + name.toLowerCase().replace(/\s+/g,"_");
  options = extend({showLabel: true}, options);
  select.id = id;

  for (i=0; i<items.length; i++) {
    option = document.createElement("option");
    option.value = i;
    option.textContent = items[i];
    select.appendChild(option);
  }

  if (options.html) setAttributesOnEl(input, options.html);
  if (options.showLabel) {
    label = document.createElement("label");
    if (this.labelGenerator) {
      label.textContent = this.labelGenerator(name, options.required);
    } else {
      label.textContent = prettyLabel(name) + (options.required ? "*" : "");
    }
    label.htmlFor = id;

    this.form.appendChild(label);
  }

  this.elements[name] = select;
  this.form.appendChild(select);
}

Builder.prototype.submit = function (name, options) {
  options = extend({showLabel: false}, options);
  if (name == undefined) {
    if (this.isNewRecord()) {
      name = "New " + this.modelClass;
    } else {
      name = "Update " + this.modelClass;
    }
  }
  this.input(name, "submit", options);
  this.elements[name].value = name;
  this.elements[name].id = null;
};

Builder.prototype.done = function () {
  this.container.appendChild(this.form);
};

Builder.prototype.isNewRecord = function () {
  return this.model.id == undefined;
}

function simpleFormFor(model, options, callback) {
  var builder;

  if (typeof options === "function") {
    callback = options
    options = {};
  }
  builder = new Builder(model, options);

  callback(builder);
}

// These are hacks that should be replaced
function pluralizeString (str) {
  return str + "s";
}

function extend (base, add) {
  var obj = JSON.parse(JSON.stringify(base)); //Clone base
  for (var i in add) {
    if (add.hasOwnProperty(i)) {
      obj[i] = add[i];
    }
  }
  return obj;
}

function setAttributesOnEl(el, options) {
  for (var attr in options) {
    if (options.hasOwnProperty(attr))
      el.setAttribute(attr, options[attr])
  }
}

function prettyLabel (label) {
  label = label.replace(/_/g," ");
  return label.substr(0,1).toUpperCase() + label.substr(1).toLowerCase();
}
