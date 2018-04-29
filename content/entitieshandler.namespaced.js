/* 
 * More info at: http://phpjs.org
 * 
 * This is version: 2.33
 * php.js is copyright 2009 Kevin van Zonneveld.
 * 
 * Portions copyright Kevin van Zonneveld (http://kevin.vanzonneveld.net),
 * Brett Zamir, Onno Marsman, Michael White (http://getsprink.com), Waldo
 * Malqui Silva, Paulo Ricardo F. Santos, Jack, Philip Peterson, Jonas Raoni
 * Soares Silva (http://www.jsfromhell.com), Legaev Andrey, Ates Goral
 * (http://magnetiq.com), Martijn Wieringa, Nate, Enrique Gonzalez, Philippe
 * Baumann, Webtoolkit.info (http://www.webtoolkit.info/), Carlos R. L.
 * Rodrigues (http://www.jsfromhell.com), Jani Hartikainen, Ash Searle
 * (http://hexmen.com/blog/), Alex, Johnny Mast (http://www.phpvrouwen.nl),
 * marrtins, d3x, GeekFG (http://geekfg.blogspot.com), Erkekjetter, Andrea
 * Giammarchi (http://webreflection.blogspot.com), David, mdsjack
 * (http://www.mdsjack.bo.it), Public Domain (http://www.json.org/json2.js),
 * Arpad Ray (mailto:arpad@php.net), Caio Ariede (http://caioariede.com),
 * Karol Kowalski, Tyler Akins (http://rumkin.com), Steven Levithan
 * (http://blog.stevenlevithan.com), Sakimori, AJ, Mirek Slugen, Alfonso
 * Jimenez (http://www.alfonsojimenez.com), Marc Palau, Thunder.m, Steve
 * Hilder, gorthaur, Pellentesque Malesuada, Aman Gupta, Paul, J A R, Marc
 * Jansen, David James, Hyam Singer (http://www.impact-computing.com/),
 * madipta, Douglas Crockford (http://javascript.crockford.com), john
 * (http://www.jd-tech.net), ger, Marco, noname, kenneth, T. Wild, Steve Clay,
 * class_exists, Francesco, David Randall, LH, Lincoln Ramsay, djmix,
 * Linuxworld, Thiago Mata (http://thiagomata.blog.com), Sanjoy Roy, Bayron
 * Guevara, Felix Geisendoerfer (http://www.debuggable.com/felix), Subhasis
 * Deb, 0m3r, duncan, Gilbert, Jon Hohle, Pyerre, Bryan Elliott, Ozh, XoraX
 * (http://www.xorax.info), Der Simon (http://innerdom.sourceforge.net/), echo
 * is bad, Tim Wiel, Brad Touesnard, sankai, marc andreu, T0bsn, MeEtc
 * (http://yass.meetcweb.com), Peter-Paul Koch
 * (http://www.quirksmode.org/js/beat.html), Slawomir Kaniecki, nobbler, Pul,
 * Luke Godfrey, Eric Nagel, rezna, Martin Pool, Kirk Strobeck, Mick@el, Blues
 * (http://tech.bluesmoon.info/), Anton Ongson, Blues at
 * http://hacks.bluesmoon.info/strftime/strftime.js, Andreas, YUI Library:
 * http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html, Christian
 * Doebler, Simon Willison (http://simonwillison.net), Gabriel Paderni,
 * penutbutterjelly, Pierre-Luc Paour, Kristof Coomans (SCK-CEN Belgian
 * Nucleair Research Centre), hitwork, Norman "zEh" Fuchs, sowberry, Yves
 * Sucaet, Nick Callen, ejsanders, johnrembo, dptr1988, Pedro Tainha
 * (http://www.pedrotainha.com), Valentina De Rosa, Saulo Vallory, T.Wild,
 * metjay, DxGx, Alexander Ermolaev
 * (http://snippets.dzone.com/user/AlexanderErmolaev), ChaosNo1, Garagoth,
 * Andrej Pavlovic, Manish, Cord, Matt Bradley, Robin, Josh Fraser
 * (http://onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/),
 * FremyCompany, taith, Victor, stensi, Arno, Nathan, Mateusz "loonquawl"
 * Zalega, ReverseSyntax, Jalal Berrami, Francois, Scott Cariss, Breaking Par
 * Consulting Inc
 * (http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256CFB006C45F7),
 * Tod Gentille, Luke Smith (http://lucassmith.name), Rival, Cagri Ekin,
 * booeyOH, Dino, Leslie Hoare, Ben Bryan, Diogo Resende, Howard Yeend,
 * gabriel paderni, FGFEmperor, baris ozdil, Yannoo, jakes, Allan Jensen
 * (http://www.winternet.no), Benjamin Lupton, Atli Þór
 * 
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */ 


//Used under the MIT (MIT-LICENSE.txt)
//NAMESPACED

if(typeof(PHP_JS) == "undefined"){
    var PHP_JS = function() {
        if(window == this || !this.init){
            return new PHP_JS();
        }else{
            return this.init();
        }
    };
}

PHP_JS.prototype = {
    // {{{ init: 
    init: function() {
        // Makes autoloading system works properly.
        // 
        // %        note 1: Not a real PHP.JS function, necessary for namespaced version, though.
    
    },// }}}
    get_html_translation_table: function(table, quote_style) {
        // Returns the internal translation table used by htmlspecialchars and htmlentities  
        // 
        // version: 903.1614
        // discuss at: http://phpjs.org/functions/get_html_translation_table
        // +   original by: Philip Peterson
        // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: noname
        // +   bugfixed by: Alex
        // +   bugfixed by: Marco
        // +   bugfixed by: madipta
        // %          note: It has been decided that we're not going to add global
        // %          note: dependencies to php.js. Meaning the constants are not
        // %          note: real constants, but strings instead. integers are also supported if someone
        // %          note: chooses to create the constants themselves.
        // %          note: Table from http://www.the-art-of-web.com/html/character-codes/
        // *     example 1: $P.get_html_translation_table('HTML_SPECIALCHARS');
        // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
        
        var entities = {}, histogram = {}, decimal = 0, symbol = '';
        var constMappingTable = {}, constMappingQuoteStyle = {};
        var useTable = {}, useQuoteStyle = {};
        
        useTable      = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
        useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
        
        // Translate arguments
        constMappingTable[0]      = 'HTML_SPECIALCHARS';
        constMappingTable[1]      = 'HTML_ENTITIES';
        constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
        constMappingQuoteStyle[2] = 'ENT_COMPAT';
        constMappingQuoteStyle[3] = 'ENT_QUOTES';
        
        // Map numbers to strings for compatibilty with PHP constants
        if (!isNaN(useTable)) {
            useTable = constMappingTable[useTable];
        }
        if (!isNaN(useQuoteStyle)) {
            useQuoteStyle = constMappingQuoteStyle[useQuoteStyle];
        }
    
        if (useTable == 'HTML_SPECIALCHARS') {
            // ascii decimals for better compatibility
            entities['38'] = '&amp;';
            if (useQuoteStyle != 'ENT_NOQUOTES') {
                entities['34'] = '&quot;';
            }
            if (useQuoteStyle == 'ENT_QUOTES') {
                entities['39'] = '&#039;';
            }
            entities['60'] = '&lt;';
            entities['62'] = '&gt;';
        } else if (useTable == 'HTML_ENTITIES') {
            // ascii decimals for better compatibility
            entities['38']  = '&amp;';
            if (useQuoteStyle != 'ENT_NOQUOTES') {
                entities['34'] = '&quot;';
            }
            if (useQuoteStyle == 'ENT_QUOTES') {
                entities['39'] = '&#039;';
            }
            entities['60']  = '&lt;';
            entities['62']  = '&gt;';
            entities['160'] = '&nbsp;';
            entities['161'] = '&iexcl;';
            entities['162'] = '&cent;';
            entities['163'] = '&pound;';
            entities['164'] = '&curren;';
            entities['165'] = '&yen;';
            entities['166'] = '&brvbar;';
            entities['167'] = '&sect;';
            entities['168'] = '&uml;';
            entities['169'] = '&copy;';
            entities['170'] = '&ordf;';
            entities['171'] = '&laquo;';
            entities['172'] = '&not;';
            entities['173'] = '&shy;';
            entities['174'] = '&reg;';
            entities['175'] = '&macr;';
            entities['176'] = '&deg;';
            entities['177'] = '&plusmn;';
            entities['178'] = '&sup2;';
            entities['179'] = '&sup3;';
            entities['180'] = '&acute;';
            entities['181'] = '&micro;';
            entities['182'] = '&para;';
            entities['183'] = '&middot;';
            entities['184'] = '&cedil;';
            entities['185'] = '&sup1;';
            entities['186'] = '&ordm;';
            entities['187'] = '&raquo;';
            entities['188'] = '&frac14;';
            entities['189'] = '&frac12;';
            entities['190'] = '&frac34;';
            entities['191'] = '&iquest;';
            entities['192'] = '&Agrave;';
            entities['193'] = '&Aacute;';
            entities['194'] = '&Acirc;';
            entities['195'] = '&Atilde;';
            entities['196'] = '&Auml;';
            entities['197'] = '&Aring;';
            entities['198'] = '&AElig;';
            entities['199'] = '&Ccedil;';
            entities['200'] = '&Egrave;';
            entities['201'] = '&Eacute;';
            entities['202'] = '&Ecirc;';
            entities['203'] = '&Euml;';
            entities['204'] = '&Igrave;';
            entities['205'] = '&Iacute;';
            entities['206'] = '&Icirc;';
            entities['207'] = '&Iuml;';
            entities['208'] = '&ETH;';
            entities['209'] = '&Ntilde;';
            entities['210'] = '&Ograve;';
            entities['211'] = '&Oacute;';
            entities['212'] = '&Ocirc;';
            entities['213'] = '&Otilde;';
            entities['214'] = '&Ouml;';
            entities['215'] = '&times;';
            entities['216'] = '&Oslash;';
            entities['217'] = '&Ugrave;';
            entities['218'] = '&Uacute;';
            entities['219'] = '&Ucirc;';
            entities['220'] = '&Uuml;';
            entities['221'] = '&Yacute;';
            entities['222'] = '&THORN;';
            entities['223'] = '&szlig;';
            entities['224'] = '&agrave;';
            entities['225'] = '&aacute;';
            entities['226'] = '&acirc;';
            entities['227'] = '&atilde;';
            entities['228'] = '&auml;';
            entities['229'] = '&aring;';
            entities['230'] = '&aelig;';
            entities['231'] = '&ccedil;';
            entities['232'] = '&egrave;';
            entities['233'] = '&eacute;';
            entities['234'] = '&ecirc;';
            entities['235'] = '&euml;';
            entities['236'] = '&igrave;';
            entities['237'] = '&iacute;';
            entities['238'] = '&icirc;';
            entities['239'] = '&iuml;';
            entities['240'] = '&eth;';
            entities['241'] = '&ntilde;';
            entities['242'] = '&ograve;';
            entities['243'] = '&oacute;';
            entities['244'] = '&ocirc;';
            entities['245'] = '&otilde;';
            entities['246'] = '&ouml;';
            entities['247'] = '&divide;';
            entities['248'] = '&oslash;';
            entities['249'] = '&ugrave;';
            entities['250'] = '&uacute;';
            entities['251'] = '&ucirc;';
            entities['252'] = '&uuml;';
            entities['253'] = '&yacute;';
            entities['254'] = '&thorn;';
            entities['255'] = '&yuml;';
        } else {
            throw Error("Table: "+useTable+' not supported');
            return false;
        }
        
        // ascii decimals to real symbols
        for (decimal in entities) {
            symbol = String.fromCharCode(decimal);
            histogram[symbol] = entities[decimal];
        }
        
        return histogram;
    }
    ,
    html_entity_decode: function( string, quote_style ) {
        // Convert all HTML entities to their applicable characters  
        // 
        // version: 901.714
        // discuss at: http://phpjs.org/functions/html_entity_decode
        // +   original by: john (http://www.jd-tech.net)
        // +      input by: ger
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +   improved by: marc andreu
        // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: get_html_translation_table
        // *     example 1: $P.html_entity_decode('Kevin &amp; van Zonneveld');
        // *     returns 1: 'Kevin & van Zonneveld'
        // *     example 2: $P.html_entity_decode('&amp;lt;');
        // *     returns 2: '&lt;'
        var histogram = {}, symbol = '', tmp_str = '', entity = '';
        tmp_str = string.toString();
        
        if (false === (histogram = this.get_html_translation_table('HTML_ENTITIES', quote_style))) {
            return false;
        }
    
        // &amp; must be the last character when decoding!
        delete(histogram['&']);
        histogram['&'] = '&amp;';
    
        for (symbol in histogram) {
            entity = histogram[symbol];
            tmp_str = tmp_str.split(entity).join(symbol);
        }
        
        return tmp_str;
    }
    ,
    htmlentities: function (string, quote_style) {
        // Convert all applicable characters to HTML entities  
        // 
        // version: 812.3017
        // discuss at: http://phpjs.org/functions/htmlentities
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: nobbler
        // +    tweaked by: Jack
        // +   bugfixed by: Onno Marsman
        // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: get_html_translation_table
        // *     example 1: $P.htmlentities('Kevin & van Zonneveld');
        // *     returns 1: 'Kevin &amp; van Zonneveld'
        var histogram = {}, symbol = '', tmp_str = '', entity = '';
        tmp_str = string.toString();
        
        if (false === (histogram = this.get_html_translation_table('HTML_ENTITIES', quote_style))) {
            return false;
        }
        
        for (symbol in histogram) {
            entity = histogram[symbol];
            tmp_str = tmp_str.split(symbol).join(entity);
        }
        
        return tmp_str;
    }
    ,
    htmlspecialchars: function (string, quote_style) {
        // Convert special characters to HTML entities  
        // 
        // version: 812.3017
        // discuss at: http://phpjs.org/functions/htmlspecialchars
        // +   original by: Mirek Slugen
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Nathan
        // +   bugfixed by: Arno
        // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: get_html_translation_table
        // *     example 1: $P.htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
        // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
        var histogram = {}, symbol = '', tmp_str = '', entity = '';
        tmp_str = string.toString();
        
        if (false === (histogram = this.get_html_translation_table('HTML_SPECIALCHARS', quote_style))) {
            return false;
        }
        
        for (symbol in histogram) {
            entity = histogram[symbol];
            tmp_str = tmp_str.split(symbol).join(entity);
        }
        
        return tmp_str;
    }
    ,
    htmlspecialchars_decode: function(string, quote_style) {
        // Convert special HTML entities back to characters  
        // 
        // version: 901.714
        // discuss at: http://phpjs.org/functions/htmlspecialchars_decode
        // +   original by: Mirek Slugen
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Mateusz "loonquawl" Zalega
        // +      input by: ReverseSyntax
        // +      input by: Slawomir Kaniecki
        // +      input by: Scott Cariss
        // +      input by: Francois
        // +   bugfixed by: Onno Marsman
        // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: get_html_translation_table
        // *     example 1: $P.htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
        // *     returns 1: '<p>this -> &quot;</p>'
        var histogram = {}, symbol = '', tmp_str = '', entity = '';
        tmp_str = string.toString();
        
        if (false === (histogram = this.get_html_translation_table('HTML_SPECIALCHARS', quote_style))) {
            return false;
        }
    
        // &amp; must be the last character when decoding!
        delete(histogram['&']);
        histogram['&'] = '&amp;';
    
        for (symbol in histogram) {
            entity = histogram[symbol];
            tmp_str = tmp_str.split(entity).join(symbol);
        }
        
        return tmp_str;
    }
}; // End PHP_JS prototype 

window.$P = PHP_JS();