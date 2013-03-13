/**
 * placeholder - HTML5 input placeholder polyfill
 * Copyright (c) 2012 DIY Co
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */
(function($) {

	var NATIVE_SUPPORT = ('placeholder' in document.createElement('input'));
	var CONTAINER_CSS_PROPERTIES = [
		'-moz-box-sizing', '-webkit-box-sizing', 'box-sizing',
		'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
		'line-height', 'font-size', 'font-family',
		'float', 'text-align', 'position', 'width', 'height',
		'top', 'left', 'right', 'bottom'
	];
	
	var PLACEHOLDER_CSS_PROPERTIES = [
		'-moz-box-sizing', '-webkit-box-sizing', 'box-sizing',
		'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
		'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
		'line-height', 'font-size', 'font-family', 'width', 'height',
		'text-align',
		//'top', 'left', 'right', 'bottom'
	];

	var setupPlaceholder = function(input, options) {
		var i, evt, text, styles, zIndex, marginTop, dy, attrNode;
		var $input = $(input), $placeholder;

		try {
			attrNode = $input[0].getAttributeNode('placeholder');
			if (!attrNode) return;
			text = $input[0].getAttribute('placeholder');
			if (!text || !text.length) return;
			$input[0].setAttribute('placeholder', '');
			$input.data('placeholder', text);
		} catch (e) {
			return;
		}

		// enumerate textbox styles for mimicking - these will be applied to the container div
		container_styles = {};
		for (i = 0; i < CONTAINER_CSS_PROPERTIES.length; i++) {
			container_styles[CONTAINER_CSS_PROPERTIES[i]] = $input.css(CONTAINER_CSS_PROPERTIES[i]);
		};

		// enumerate textbox styles for mimicking - these will be applied to the placeholder overlay
		placeholder_styles = {};
		for (i = 0; i < PLACEHOLDER_CSS_PROPERTIES.length; i++) {
			placeholder_styles[PLACEHOLDER_CSS_PROPERTIES[i]] = $input.css(PLACEHOLDER_CSS_PROPERTIES[i]);
		};
		
		
		zIndex = parseInt($input.css('z-index'), 10);
		if (isNaN(zIndex) || !zIndex) zIndex = 1;
		
	
		// create the placeholder container div - needs to be created before PH overlay span
		$container = $('<div>').addClass('placeholder-container');
		$container.css(container_styles);
		$container.css({
			'cursor': $input.css('cursor') || 'text',
			'display': 'block',
			//'position': 'relative',
			'overflow': 'hidden',
			'z-index': zIndex + 1,
			'background': 'none',
			'border-top-style': 'solid',
			'border-right-style': 'solid',
			'border-bottom-style': 'solid',
			'border-left-style': 'solid',
			'border-top-color': 'transparent',
			'border-right-color': 'transparent',
			'border-bottom-color': 'transparent',
			'border-left-color': 'transparent',
			'border-top-width': '0',
			'border-right-width': '0',
			'border-bottom-width': '0',
			'border-left-width': '0',
			'padding-right': '0',
			'padding-left': '0',
			'padding-top': '0',
			'padding-bottom': '0',
			'margin-right': 'auto',
			'margin-left': 'auto',
			'margin-top': 'auto',
			'margin-bottom': 'auto',
			'width': ( parseInt($container.css("width")) + parseInt($container.css("padding-left")) + parseInt($container.css("padding-right")) + parseInt($(input).css("border-left-width")) + parseInt($(input).css("border-right-width")) ) + 'px',
			'height': ( parseInt($container.css("height")) + parseInt($container.css("padding-top")) + parseInt($container.css("padding-bottom")) + parseInt($(input).css("border-top-width")) + parseInt($(input).css("border-bottom-width")) ) + 'px',
		});
		$(input).wrap($container);
		

		// create the placeholder overlay span - now created inside the container div generated above
		$placeholder = $('<span>').addClass('placeholder').html(text);
		$placeholder.css(placeholder_styles);
		$placeholder.css({
			'cursor': $input.css('cursor') || 'text',
			'display': 'block',
			'position': 'absolute',
			'overflow': 'hidden',
			'z-index': zIndex + 1,
			'background': 'none',
			'border-top-style': 'solid',
			'border-right-style': 'solid',
			'border-bottom-style': 'solid',
			'border-left-style': 'solid',
			'border-top-color': 'transparent',
			'border-right-color': 'transparent',
			'border-bottom-color': 'transparent',
			'border-left-color': 'transparent',
			'line-height': $(input).css("height"),
			'left': '50%',
			'margin-left': (parseInt($placeholder.css("width")) / -2) + (parseInt($placeholder.css("padding-left")) * -1) - parseInt($(input).css("border-left-width")) + 'px'
		});
		$placeholder.insertBefore($input);
		
		
		$(input).css({
			'top': 'auto',
			'right': 'auto',
			'bottom': 'auto',
			'left': 'auto'
		});
		
		
		// compensate for y difference caused by absolute / relative difference (line-height factor)
		dy = $input.offset().top - $placeholder.offset().top;
		marginTop = parseInt($placeholder.css('margin-top'));
		if (isNaN(marginTop)) marginTop = 0;
		$placeholder.css('margin-top', marginTop + dy);

		// event handlers + add to document
		$placeholder.on('mousedown', function() {
			if (!$input.is(':enabled')) return;
			window.setTimeout(function(){
				$input.trigger('focus');
			}, 0);
		});

		$input.on('focus.placeholder', function() {
			$placeholder.hide();
		});
		$input.on('blur.placeholder', function() {
			$placeholder.toggle(!$.trim($input.val()).length);
		});

		$input[0].onpropertychange = function() {
			if (event.propertyName === 'value') {
				$input.trigger('focus.placeholder');
			}
		};

		$input.trigger('blur.placeholder');
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	$.fn.placeholder = function(options) {
		var $this = this;
		options = options || {};

		if (NATIVE_SUPPORT && !options.force) {
			return this;
		}

		window.setTimeout(function() {
			$this.each(function() {
				var tagName = this.tagName.toLowerCase();
				if (tagName === 'input' || tagName === 'textarea') {
					setupPlaceholder(this, options);
				}
			});
		}, 0);

		return this;
	};

})(jQuery);
