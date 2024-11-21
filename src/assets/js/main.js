(function($) {
    "use strict";


    jQuery(document).ready(function($) {




        //------------ Offcanvas menu -------------

        $('.open__menu').on('click', function() {
            $('.mobile__menu, .overlay').addClass('active');
        })
        $('.close__menu, .overlay, mobile__menu ul li a').on('click', function() {
            $('.mobile__menu, .overlay').removeClass('active');
        })



        $('.box__inner__text i.fa-star').on('click', function() {
            $(this).toggleClass('active');
        })


    // teatimonial__blk
    $('.emails__video__slider').owlCarousel({
        loop: true,
        nav: true,
        navText: ['<i class="far fa-angle-left"></i>', '<i class="far fa-angle-right"></i>'],
        dots: false,
        autoplay: true,
        smartSpeed: 1000,
        autoplayTimeout: 3500,
        items: 3,
        margin: 40,
        slideToScroll: 1,
        center: false,
        autoplayHoverPause: true,

        responsive: {
            0: {
                stagePadding: 0,
            },
            320: {
                items: 1,
                stagePadding: 0,
            },
            450: {
                items: 2,
                margin: 20,
                stagePadding: 0,
            },
            575: {
                items: 3,
                margin: 20,
                stagePadding: 0,
            },
            768: {
                items: 3,
                margin: 30,
                stagePadding: 0,
            },
            992: {
                items: 3,
                stagePadding: 0,
            },
            1200: {
                stagePadding: 0,
            },
            1360: {
                stagePadding: 0,
            },
            1449: {
                stagePadding: 0,
            },
            1500: {
                stagePadding: 0,
            },
            1600: {
                stagePadding: 0,
            },
            1700: {
                stagePadding: 0,
            }
        }

    });



        // You can also pass an optional settings object
        // below listed default settings
       


    }); //---document-ready-----



    /*magnificPopup active*/
    $('.play__button').magnificPopup({
        type: 'iframe'

    });


}(jQuery));