/**
 * mTip, by mauvm
 * Sep 13, 2011
 * version 1.0.1
 * http://dev.mauvm.nl/mTip
 *
 * mTip is dual licensed under the MIT and GPL licenses.
 **/
/* IE < 9 fix, ugh! */ if(!Array.prototype.indexOf){Array.prototype.indexOf=function(elt/*, from*/){var len=this.length>>>0;var from=Number(arguments[1])||0;from=(from<0?Math.ceil(from):Math.floor(from));if(from<0){from += len;}for(;from<len;from++){if(from in this&&this[from]===elt)return from;}return -1;};}

( function( $ ) {
	// Functionality
	var methods = {
		init		: function( options ) {
			options = $.extend( true, {}, defaults, options );
			
			// Build tip
			// > Holder
			options.holder				= typeof options.holder === 'object' ? options.holder : $( options.holder );
			
			// > Events
			if( typeof options.showOn 	=== 'object' )		options.showOn		= options.showOn  .join( ' ' ).replace( ',', ' ' ); // $.extend makes it [ 'mouseenter,focus' ], this changes it back to 'mouseenter focus'
			if( typeof options.hideOn 	=== 'object' )		options.hideOn		= options.hideOn  .join( ' ' ).replace( ',', ' ' ); // This also allowes comma separated event names
			if( typeof options.updateOn === 'object' )		options.updateOn	= options.updateOn.join( ' ' ).replace( ',', ' ' );
			
			options.showOn 				= ( '' + options.showOn   ).split( ' ' );
			options.hideOn 				= ( '' + options.hideOn   ).split( ' ' );
			options.updateOn 			= ( '' + options.updateOn ).split( ' ' );
			
			// > Prepare events (cache)
			var showEvent				= options.showOn  .join( '.mTip ' ) + '.mTip',
				hideEvent				= options.hideOn  .join( '.mTip ' ) + '.mTip',
				updateEvent				= options.updateOn.join( '.mTip ' ) + '.mTip';
			
			// > Live content
			var liveContent 			= ( typeof options.content === 'function' );
			
			// > Timing options
			if	   ( options.fade === true  )				options.fade		= defaults.fade;
			else if( options.fade === false )				options.fade		= 0;
			
			if( typeof options.fade			!== 'object' ) 	options.fade 		= [ options.fade, options.fade ];
			if( typeof options.delay		!== 'object' ) 	options.delay 		= [ options.delay, options.delay ];
			if( typeof options.fadeEasing 	!== 'object' )	options.fadeEasing 	= [ options.fadeEasing, options.fadeEasing ];
							
			// > Aligning
			if( typeof options.spacing	!== 'object' ) 		options.spacing 	= [ options.spacing, options.spacing ];
			
			options.align = {
				top		: options.align.indexOf( 'top' )    !== -1,
				bottom	: options.align.indexOf( 'bottom' ) !== -1,
				right	: options.align.indexOf( 'right' )  !== -1,
				left	: options.align.indexOf( 'left' )   !== -1
			};
			
			// Alignment class
			var alignClass = 'mTip';
			
			if( options.align.top )		alignClass += '-top';
			if( options.align.bottom )	alignClass += '-bottom';
			if( options.align.right )	alignClass += '-right';
			if( options.align.left )	alignClass += '-left';
			
			// Maintain chainability
			return this.each( function() {
				var $this		= $(this),
					data		= $this.data( 'mTip' ) || {},
					timer		= [ null, null ], // fadeIn timer, fadeOut timer
					value		= '';

				// (re)Create tip
				if( data && data.tipID ) $( '#' + data.tipID ).remove(); // Remove old
				
				var tipID	= 'mTip-' + ++defaults._id,
					$tip	= $( '<div id="' + tipID + '" />' );
				
				// Build tip
				// > Get initial content
				if( ! liveContent ) {
					if( options.content ) 	value = options.content;
					else					value = $this.attr( 'title' );
				}
				
				$this.removeAttr( 'title' );
			 	
				// > Set values
				if( options.className ) 	$tip.addClass( options.className );

				$tip.css( options.css )
					.addClass( 'mTip ' + alignClass )
					.html( value );
					
				options.holder.append( $tip );
					
				data = {
					tipID		: tipID,
					timer		: timer,
					options		: options
				};
				
				// > Prepare callbacks (cache)
				var showCallback			= $.proxy( options.show, $this ),
					hideCallback			= $.proxy( options.hide, $this ),
					updateCallback			= $.proxy( options.update, $this );
				
				// > (re)Bind events
				if( options.keepOnHover && options.hideOn.indexOf( 'mouseleave' ) != -1 ) {
					$tip.unbind( '.mTip' ) 	// Clear events
						.bind( 'mouseenter.mTip', function( e ) { $this.mTip( 'show' ); } )
						.bind( 'mouseleave.mTip', function( e ) { $this.mTip( 'hide' ); } );
				}

				$this
					.data( 'mTip', data ) 	// Store data
					.unbind( '.mTip' ) 		// Clear events
					.bind( showEvent, function( e ) {
						
						if( $.browser.msie ) options.holder.find( '.mTip' ).hide(); 								// IE Fix, ugh! // Hide other
						
						if( liveContent ) value = $.proxy( options.content, $this )( $tip, data, e );				// Live content

						if( timer[1] ) { clearTimeout( timer[1] ); $tip.stop( true ); timer[1] = null; }			// Clear fadeOut timer

						if( ! value ) return;																		// Don't show if no content
						
						if( liveContent ) $tip.html( value );														// Update live content
						
						if( options.showOn[0] != options.updateOn[0] ) $this.trigger( options.updateOn[0] );		// Update position
						
						timer[0] = setTimeout( function() { showCallback( $tip, options, e ); }, options.delay[0] );// Call show
					} )
					.bind( hideEvent, function( e ) {
						if( timer[0] ) { clearTimeout( timer[0] ); $tip.stop( true ); timer[0] = null; }			// Clear fadeIn timer
						
						if( options.hideOn[0] != options.updateOn[0] ) $this.trigger( options.updateOn[0] );		// Update position
						
						timer[1] = setTimeout( function() {	hideCallback( $tip, options, e ); }, options.delay[1] );// Call hide
					} )
					.bind( updateEvent, function( e ) {
						if( options.cancelUpdate ) return;															// Update cancelling
						
						updateCallback( $tip, options, e ); 														// Call update
					} );
			} );
		},
		
		show		: function() {
			// Maintain chainability
			return this.each( function() {
				var $this	= $(this),
					data	= $this.data( 'mTip' );
			
				// Trigger show
				if( data && data.options && data.options.showOn ) $this.trigger( data.options.showOn[0] );
			} );
		},
		
		hide		: function() {
			// Maintain chainability
			return this.each( function() {
				var $this	= $(this),
					data	= $this.data( 'mTip' );
			
				// Trigger hide
				if( data && data.options && data.options.hideOn ) $this.trigger( data.options.hideOn[0] );
			} );
		},
		
		update		: function() {
			// Maintain chainability
			return this.each( function() {
				var $this	= $(this),
					data	= $this.data( 'mTip' );
			
				// Trigger update
				if( data && data.options && data.options.updateOn ) $this.trigger( data.options.updateOn[0] );
			} );
		},
		
		content		: function( html ) {
			// Maintain chainability
			return this.each( function() {
				var $this	= $(this),
					data	= $this.data( 'mTip' );
			
				// Update content and reposition
				if( data && data.tipID ) {
					$( '#' + data.tipID ).html( html );
					
					$this.mTip( 'update' );
				}
			} );
		},
		
		get			: function() {
			// Build selector
			var selector = [];
			
			this.each( function() {
				var data	= $(this).data( 'mTip' );
				
				if( data && data.tipID ) selector.push( '#' + data.tipID );
			} );
			
			// Get tooltip elements
			return $( selector.join( ', ' ) );
		}
	};
	
	// Logic
	$.fn.mTip = function( method ) {
		if( methods[method] )								{ return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) ); }
		else if( typeof method === 'object' || ! method )	{ return methods.init.apply( this, arguments ); }
		else												{ $.error( 'Method ' +  method + ' does not exist on jQuery.mTip' ); }
	};
	
	// Defaults
	var defaults = {
		_id				: 0, 							// int: Auto increment tip ID
		
		// Events
		showOn			: 'mouseenter',
		show			: function( $tip, options ) {	// function
			$tip.stop( true )
				.show()
				.animate( { opacity: options.opacity }, options.fade[0], options.fadeEasing[0] );
		},
		
		hideOn			: 'mouseleave',
		hide			: function( $tip, options ) {	// function
			$tip.stop( true )
				.animate( { opacity: 0 }, options.fade[1], options.fadeEasing[1], function() { $tip.hide() } );
		},
		
		updateOn		: 'mousemove',
		update			: function( $tip, options, e ) {
			var $this = $(this), x, y, ew = 0, eh = 0, tw = $tip.innerWidth(), th = $tip.innerHeight();

			// Base position
			if( options.alignTo == 'cursor' ) {
				// Stick to cursor
				x = e.pageX; 
				y = e.pageY;
			} else {
				// Stick to element
				var offset = $this.offset();
				
				x = offset.left;
				y = offset.top;
				ew = $this.innerWidth();
				eh = $this.innerHeight();
			}
			
			// Calculate X
			if( options.align.right )		{ x += ew + options.spacing[0]; }	// Right
			else if( options.align.left )	{ x -= tw + options.spacing[0]; }	// Left
			else							{ x += ( ew - tw ) / 2; }			// Middle

			// Calculate Y
			if( options.align.bottom )		{ y += eh + options.spacing[1]; }	// Bottom
			else if( options.align.top )	{ y -= th + options.spacing[1]; }	// Top
			else							{ y += ( eh - th ) / 2; }			// Middle
			
			// Update position
			$tip.css( { left: x, top: y } );
		},
		cancelUpdate	: false,						// bool
		
		// Value
		content			: '',							// string, function
		
		// Placement
		holder			: 'body',						// string, object
		alignTo			: 'element',					// string
		align			: 'bottom right',				// string
		spacing			: 5,							// int, array
		keepOnHover		: true,							// bool
		
		// Timing
		delay			: 250,							// int, array
		fade			: 250,							// int, array
		fadeEasing		: 'linear',						// string
		
		// Styling
		className		: 'black',						// string
		opacity			: 1,							// double
		css				: {								// object
			'opacity'		: 0,
			'display'		: 'none',
			'position'		: 'absolute',
			'z-index'		: 10000
		}
	};
	
	$.fn.mTip.defaults = defaults;
} )( jQuery );