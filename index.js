//
// fast-image-size - Simple stand alone module to just extract the image size from image file without using special image libraries.
//
// Please refer to README.md for this module's documentations.
//
// NOTE:
// - Before changing this code please refer to the 'hacking the code section' on README.md.
//
// Copyright (c) 2013 Ziv Barber;
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

var fast_image_size_info = require('./package.json');
var fs = require('fs');

module.exports = exports = function ( file_path, callback ) {
	var BUF_LENGTH = 128;
	var buffer = new Buffer ( BUF_LENGTH );

	// Internal options:
	if ( file_path == '@version@' ) {
		return fast_image_size_info.version;
	} // Endif.

	function parseHeaderData ( buffer_data, callback_data ) {
		var retInfo = {};

		// Detect GIF:
		if ( buffer_data[0] == 0x47 && buffer_data[1] == 0x49 && buffer_data[2] == 0x46 ) {
			retInfo.type = 'gif';
			retInfo.width = (buffer_data[7] * 256) + buffer_data[6];
			retInfo.height = (buffer_data[9] * 256) + buffer_data[8];

		// Detect JPEG:
		} else if ( buffer_data[0] == 0xFF && buffer_data[1] == 0xD8 && buffer_data[2] == 0xFF && buffer_data[3] == 0xE0 ) {
			retInfo.type = 'jpeg';
			// console.log ( buffer_data );
			// BMK_TODO: soon...

		// Detect PNG:
		} else if ( buffer_data[0] == 137 && buffer_data[1] == 80 && buffer_data[2] == 78 && buffer_data[3] == 71 && buffer_data[4] == 13 && buffer_data[5] == 10 && buffer_data[6] == 26 && buffer_data[7] == 10 ) {
			retInfo.type = 'png';

			if ( buffer_data[12] == 0x49 && buffer_data[13] == 0x48 && buffer_data[14] == 0x44 && buffer_data[15] == 0x52 ) {
				retInfo.width = (buffer_data[16] * 256 * 256 * 256) + (buffer_data[17] * 256 * 256) + (buffer_data[18] * 256) + buffer_data[19];
				retInfo.height = (buffer_data[20] * 256 * 256 * 256) + (buffer_data[21] * 256 * 256) + (buffer_data[22] * 256) + buffer_data[23];
			} // Endif.

		// Detect BMP:
		} else if ( buffer_data[0] == 0x42 && buffer_data[1] == 0x4D ) {
			retInfo.type = 'bmp';
			retInfo.width = (buffer_data[21] * 256 * 256 * 256) + (buffer_data[20] * 256 * 256) + (buffer_data[19] * 256) + buffer_data[18];
			retInfo.height = (buffer_data[25] * 256 * 256 * 256) + (buffer_data[24] * 256 * 256) + (buffer_data[23] * 256) + buffer_data[22];
		} // Endif.

		retInfo.image = file_path;
		if ( !retInfo.type ) {
			retInfo.type = 'unknown';
		} // Endif.

		if ( callback_data ) {
			callback_data ( retInfo );
		} // Endif.

		return retInfo;
	};

	// Async mode:
	if ( callback ) {
		fs.exists ( file_path, function( exists ) {
			if ( exists ) {
				fs.stat ( file_path, function ( error, stats ) {
					if ( stats.size && (stats.size > BUF_LENGTH) ) {
						fs.open ( file_path, "r", function ( error, fd ) {
							fs.read ( fd, buffer, 0, BUF_LENGTH, null, function ( error, bytesRead, buffer ) {
								fs.close ( fd );
								parseHeaderData ( buffer, callback );
							});
						});
					} // Endif.
				});

			} else {
				throw 'Error: Invalid file name.';
			} // Endif.
		});

	// Sync mode:
	} else {
		var fd = fs.openSync ( file_path, "r" );
		var bytesRead = fs.readSync ( fd, buffer, 0, BUF_LENGTH, 0 );
		fs.close ( fd );
		return parseHeaderData ( buffer, null );
	} // Endif.
};

