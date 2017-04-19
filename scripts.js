// Given a clean page name, fetch Wikipedia article contents for that page
function viewWikipediaPage(page) {
    $.ajax({
        type: 'GET',
        url: 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=' + page + '&callback=?',
        contentType: 'application/json; charset=utf-8',
        async: false,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
            var raw = data.parse.text['*'];
            var wiki = $('<div></div>').html(raw);
            handleRedirect(wiki);
            fixLinks(wiki);
            $('#wiki-contents').html($(wiki));
        },
        error: function(errorMessage) {
            console.log('Error: ' + errorMessage);
        }
    });
}

// View random Wikipedia article
function viewRandomWiki() {
    $.ajax({
        type: 'GET',
        url: 'https://simple.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extract&format=json&callback=?',
        contentType: 'application/json; charset=utf-8',
        async: false,
        dataType: 'json',
        success: function(data) {
            var page = data["query"]["pages"][Object.keys(data["query"]["pages"])[0]]["title"];
            viewWikipediaPage(page);
        },
        error: function(errorMessage) {
            console.log('Error: ' + errorMessage);
        }
    });
}

// Fix links
function fixLinks(wiki) {
    return wiki.find('a').each(function() {
        var page = $(this).attr('href');
        if(page === undefined || page.indexOf('/wiki/') === -1) {
            $(this).replaceWith($(this).html());
        } else {
            if(page.indexOf('.jpg') !== -1 || page.indexOf('.jpeg') !== -1 || page.indexOf('.png') !== -1) {
                $(this).remove();
            }
            if(page.indexOf(':') !== -1) {
                $(this).remove();
            }
            page = page.substr(page.lastIndexOf('/') + 1);
            $(this).click(function() {
                viewWikipediaPage(page);
            });
            $(this).attr('href', '#');
        }
    });
}

// Tidy up markup
function scrubWiki(wiki) {
    removeCitationErrors(wiki);
    removeReferences(wiki);
    removeDisambigbox(wiki);
    wiki.find('img').remove();
    wiki.find('.thumb').remove();
    wiki.find('.mbox-text').remove();
    wiki.find('.mbox-image').remove();
    wiki.find('.portal').remove();
    wiki.find('.reflist').remove();
    wiki.find('#references').remove();
    wiki.find('.references').remove();
}

// Remove references
function removeReferences(wiki) {
    return wiki.find('sup').remove();
}

// Remove citation errors
function removeCitationErrors(wiki) {
    return wiki.find('.mw-ext-cite-error').remove();
}

// Remove disambigbox
function removeDisambigbox(wiki) {
    return wiki.find('#disambigbox').remove();
}

// Handle redirects
function handleRedirect(wiki) {
    if(wiki.has('.redirectText')[0] !== undefined) {
        var title = wiki.find('a').first().attr('title');
        viewWikipediaPage(title);
    }
}

$(document).ready(function() {
    // Define event handler for form submission
    $('#search-form').submit(function(event) {
        event.preventDefault();
        var searchTerm = $('#search-input').val();
        viewWikipediaPage(searchTerm);
    });
    $('#random').click(function(event) {
        event.preventDefault();
        viewRandomWiki();
    });
});


