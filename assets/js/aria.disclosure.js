;(function ( w, doc, undefined ) {
  'use strict';

  /**
   * Local object for method references
   * and define script meta-data
   */
  var ARIAdisclosure = {};
  w.ARIAdisclosure   = ARIAdisclosure;

  ARIAdisclosure.NS      = 'ARIAdisclosure';
  ARIAdisclosure.AUTHOR  = 'Scott O\'Hara';
  ARIAdisclosure.VERSION = '1.0.0';
  ARIAdisclosure.LICENSE = '';

  var widgetContainer = 'disclosure';
  var widgetTrigger   = 'disclosure__trigger';
  var widgetContent   = 'disclosure__content';

  var idCounter = 0;

  /**
   * Global Create
   *
   * This function validates that the minimum required markup
   * is present to create the ARIA widget(s).
   * Any additional markup elements or attributes that
   * do not exist in the found required markup patterns
   * will be generated via this function.
   */
  ARIAdisclosure.create = function () {
    var widget = doc.querySelectorAll('[data-disclosure]');
    var i;

    idCounter += 1;

    for ( i = 0; i < widget.length; i++ ) {
      // Easy self reference
      var self = widget[i];
      var contentArea;
      var contentExpanded = false;
      var triggerText = self.getAttribute('data-disclosure') || null;

      /**
       * Check for an ID and if there isn't one, generate it.
       */
      if ( !self.hasAttribute('id') ) {
        self.id = 'dw_' + idCounter + '-' + i;
      }

      self.classList.add(widgetContainer);

      /**
       * Find the content area that will be shown/hidden.
       */
      contentArea = self.querySelector('.' + widgetContent);
      contentArea.id = self.id + '_content';

      if ( !self.hasAttribute('data-open') ) {
        contentArea.setAttribute('hidden', '');
      }
      else {
        contentExpanded = true;
      }
    } // for(widget.length)
  }; // ARIAdisclosure.create()



  ARIAdisclosure.keyEvents = function ( e ) {
    if ( e.target.classList.contains(widgetTrigger) ) {
      var keyCode = e.keyCode || e.which;
    }
  }; // ARIAdisclosure.keyEvents()


  /**
   * Initialize disclosure Functions
   * if expanding this script, place any other
   * initialize functions within here.
   */
  ARIAdisclosure.init = function () {
    ARIAdisclosure.create();
  };


  // go go JavaScript
  ARIAdisclosure.init();


})( window, document );
