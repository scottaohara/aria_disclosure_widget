/**
   * ARIA Disclosure Widget
   * Custom disclosure widget base script to show/hide
   * all your web content.
   *
   * Author: Scott O'Hara
   * Version: 2.0.1
   * License: https://github.com/scottaohara/aria_disclosure_widget/blob/master/LICENSE
   */

const ARIAdwOptions = {
  baseID: 'aDW_',
  triggerClass: 'disclosure__trigger',
  triggerLocation: '[data-insert-trigger]',
  contentSelector: 'disclosure-content',
  buttonLabelAttr: 'data-trigger',
  initialStateAttr: 'data-open',
  triggerEnabled: true,
  popupAttr: 'data-popup',
  fallBackBtnText: 'More info'
};

const ARIAdw = function ( inst, options ) {
  const _options = Object.assign(ARIAdwOptions, options);
  const el = inst;
  let trigger;
  let triggerID;
  let content;
  let expandedState = el.hasAttribute(_options.initialStateAttr) || false;
  let triggerEnabled = _options.triggerEnabled;


  const init = function () {
    /**
     * Create the IDs for content / triggers, respecting
     * the existing IDs of 1. the content > 2. the widget container > 3. generate if no usable IDs exist
     */
    content = el.querySelector(_options.contentSelector);

    if ( !content ) {
      console.warn('no content defined');
      return false;
    }

    defineIDs();
    setupTrigger();
    setupContent();

    trigger.addEventListener('click', toggleEvent);
  };


  const defineIDs = function ( ) {
    if ( content.id ) {
      triggerID = content.id + '_trigger';
    }
    else if ( el.id ) {
      triggerID = el.id + '_trigger';
    }
    else {
      triggerID = _options.baseID + Math.floor(Math.random() * 999);
    }
  };


  /**
   * Create the button element to serve as the
   * trigger for the disclosure widget
   */
  const setupTrigger = function () {
    let btnContent;
    let btnLocate;

    const newBtn = document.createElement('button');
    newBtn.id = triggerID;
    newBtn.type = 'button';
    newBtn.classList.add('disclosure__trigger');
    newBtn.setAttribute('aria-expanded', expandedState);

    if ( el.hasAttribute('data-disabled') || !triggerEnabled ) {
      newBtn.disabled = true;
    }

    if ( el.hasAttribute(_options.buttonLabelAttr) ) {
      if ( el.getAttribute(_options.buttonLabelAttr) === '' ) {
        btnContent = _options.fallBackBtnText;
      }
      else {
        btnContent = el.getAttribute(_options.buttonLabelAttr);
      }
      el.insertBefore(newBtn, el.firstChild);
    }
    else {
      btnLocate = el.querySelector(_options.triggerLocation) || false;
      if ( btnLocate ) {
        btnContent = btnLocate.innerHTML;
        if ( btnContent === '' ) {
          newBtn.setAttribute('aria-label', _options.fallBackBtnText);
        }
        btnLocate.innerHTML = '';
        btnLocate.append(newBtn);
      }
      else {
        btnContent = _options.fallBackBtnText;
        el.insertBefore(newBtn, el.firstChild);
      }
    }

    newBtn.innerHTML = btnContent;

    trigger = newBtn;
    return trigger;
  };


  /**
   * Function to hide content panels which have not been
   * specified to be revealed by default.
   *
   * Assigns generated IDs to the content container.
   *
   * If specified as a 'popup', then provide the content container
   * a role=note and tabindex=-1. 1st, so that the element exposes a
   * role which "makes sense" without having an accName (because if
   * using a generic, then the contents of the element would become the
   * generic's accname in chromium browsers... and that's bad.
   * and 2, because without the tabindex=-1 (which is what would make
   * the generic try to get its name from contents) the popup will
   * revert to the hidden state due to the focusout function.
   * That function could probably just be smarter, but this is how
   * this is being solved for now.
   */
  const setupContent = function () {
    if ( !expandedState ) {
      content.classList.add('is-hidden');
    }
    if ( !content.id ) {
      content.id = triggerID + '_content';
    }
    
    if ( el.hasAttribute(_options.popupAttr) ) {
      content.tabIndex = '-1'; 
      content.setAttribute('role', 'note');
      el.classList.add('has-popup');
      el.addEventListener('focusout', focusOutEvent, false);
      el.addEventListener('keydown', escEvent, false);
    }
  };


  /**
   * Function to expose the expanded / collapsed state
   * of the disclosure widget. Toggles the 'is-hidden'
   * class on the associated content based on the state
   * of the trigger.
   *
   * Updates 'expandedState' as this is needed for
   * other functions that reuse this toggleEvent.
   */
  const toggleEvent = function ( e ) {
    if ( expandedState ) {
      trigger.setAttribute('aria-expanded', 'false');
      content.classList.add('is-hidden');
      expandedState = false;
    }
    else {
      trigger.setAttribute('aria-expanded', 'true');
      content.classList.remove('is-hidden');
      expandedState = true;
    }
  };


  /**
   * If focus leaves the containing element of the
   * trigger & the flyout content, then close the
   * flyout and return the content to the collapsed
   * state.
   *
   * Runs the toggleEvent, so checks to make sure the
   * trigger is in the expandedState, so as to not
   * just randomly expand content while navigating
   * by Tab key.
   */
  const focusOutEvent = function ( e ) {
    if ( !el.contains(e.relatedTarget) && expandedState === true) {
      toggleEvent();
    }
  };


  /**
   * Close a flyout via the ESC key
   * Reuses the toggleEvent, so also checks to make
   * sure the trigger is in the expandedState first,
   * so as to not allow the ESC key to unexpectedly
   * reveal the associated content, if pressed on the
   * trigger in the collapsed state.
   *
   * Focuses the trigger to ensure that if someone
   * hits the ESC key within the exposed content, then
   * focus does not get lost.
   */
  const escEvent = function ( e ) {
    switch ( e.key ) {
      case 'Escape':
        if ( expandedState === true ) {
          toggleEvent();
          trigger.focus();
        }
        break;

      default:
        break;
    }
  };


  init.call( this );
}; // ARIAdw()
