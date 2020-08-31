//probandojson
// Framework7.request.get('https://sib.gob.ar/api/2.0.0/ficha-area-protegida/areas-protegidas', function (data) {
//   console.log(data);
// });

// cambiar esta variable segun corresponda
var API_URL = 'http://192.168.2.111:8000/api';
var tBoton='hola';
var myApp = new Framework7();
var busquedaInicial='';

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var historial = localforage.createInstance({
  name: "Historial"
});

var libros_favoritos = localforage.createInstance({
  name: "Libros_favoritos"
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});


function tomarFoto() {
    navigator.camera.getPicture(
        function (imageData) {
            console.log(imageData);
            var image = document.getElementById('myImage');
            image.src = imageData;
        }, 
        function (message){
            alert(message);
        },{
            targetHeight: 400,
            cameraDirection: 1
        }); 
}

//prueba
$$('.pages').on('submit','#form-busqueda', function(e){
    console.log('submiteado');
    e.preventDefault();
    e.stopPropagation();
    var param2 = $$('#form-busqueda').val();
    var param = $$('#busqueda').val();
    console.log(param);
    var direccion=API_URL+'/search?busqueda='+param;
    historial.setItem(param, direccion).then(function (value) {
                console.log(value);
            }).catch(function(err) {
                // This code runs if there were any errors
                console.log(err);
            });
    $$.ajax({
        url: API_URL + '/search',
        data: {busqueda: param,
            categoria: null},
        dataType: 'json',
        success: function(data) {
            console.log('exito');
            $('#resultados').html('Resultados:');
            //$('#libros').html('<div class="preloader"></div>');
            insertarLibros(data);
        },
        error: function(xhr, status) {
            console.log('fallo');
            console.log(status);
            console.log(JSON.stringify(xhr));
        }
    });
});

function insertarLibros(data) {
    let templateLibros='';
    data.forEach(function (item) {
        /*templateLibros+=`
            <div class="card">
                <div class="card-header">${item.titulo}</div> 
                    <div class="card-content card-content-padding">${item.resumen}</div>
                <div class="card-footer">
                    <a id="${item.id}" class="ficha button" href="ficha.html">Ver</a>
                </div>
            </div>
        `;*/
        templateLibros+=`
        <a id="${item.id}" class="ficha" href="ficha.html">
            <div class="card">
                <div class="card-header">${item.titulo}</div> 
                <div class="card-content card-content-padding">${item.resumen}</div>
                <div class="card-footer">
                    
                </div>
            </div>
            </a>
        `;
        // onclick="insertarFicha(${item});" 
    }); 
    console.log(this);
    $$('#libros').html(templateLibros); 
}


//boton para una ficha
$('#libros').on('click','.ficha',function(id){
            console.log('entranding '+id);
            console.log('entrando a ficha '+this.id);
            urlFicha=API_URL+'/ficha/'.concat(this.id);
            console.log(urlFicha);
            $$.getJSON(urlFicha, function (data) { 
                insertarFicha(data);
            });
           
        });




function insertarFicha(item) {
    
    let templateLibro='';
    console.log(item.titulo);
    
        libroActual=item;
        
        //para las categorias
        categorias=item.categoria;
        let templateCategorias='';
        if (categorias.length>1) {
            templateCategorias='<p><h2>Categorias</h2></p></p>';
        } else {
            templateCategorias='<p><h2>Categoria</h2></p></p>';
        }
        categorias.forEach(function(categoria) {
            templateCategorias+=`
                <div class="chip">
                    <div class="chip-label">${categoria.nombre}</div>
                </div>                
            `;
        });


        templateCategorias+='</p>';
        //para los autores
        autores=item.autor;
        let templateAutores='';
        if (autores.length>1) {
            templateAutores='<p><h2>Autores</h2></p>';
        } else {
            templateAutores='<p><h2>Autor</h2></p>';
        }
        autores.forEach(function(autor) {
            templateAutores+=`
                <div class="chip">
                    <div class="chip-label">${autor.nombre} ${autor.apellido}</div>
                </div>
            `;
        });

        
        templateLibro+=`
            <div class="block-title"><h1>${item.titulo}</h1></div>
            <img src="${item.portada}">
            <div class="block block-strong">
                <p>${templateAutores}</p>
                <p>${item.descripcion}</p>
                <p><h2>Idioma</h2></p>
                <p>${item.idioma.nombre}</p>
                ${templateCategorias}
                <p><h2>Año Publicacion</h2></p>
                <p>${item.anio_publicacion}</p>
                <p><h2>Detalles de la edicion</h2></p>
                <p>N° de edicion: ${item.num_edicion}</p> 
                <p>Año: ${item.anio_edicion}</p>
                <p><h2>Editorial</h2></p>
                <p>${item.editorial}</p>                
                <p><a href="#" class="button notification-custom">Favorito</a></p>
            </div>
            `;//poner un if para el boton favorito if valor==null { guardar en favoritos }


        $$('#ficha').html(templateLibro); 
    //$$(document).on('pageInit', '.page[data-page="ficha"]',function () {

}

$$(document).on('click','.notification-custom', function () {

    autores=libroActual.autor;
    var notifAutores='';
    autores.forEach(function(autor) {
        notifAutores+=`
            <p>${autor.nombre} ${autor.apellido}</p>
        `;
    });
    libros_favoritos.getItem(libroActual.id, function(err, value) {
                if (value==null) {
                    libros_favoritos.setItem(libroActual.id, libroActual).then(function (value) {
                            // Do other things once the value has been saved.
                            console.log('Guardado');
                            console.log(value);
                            myApp.addNotification({
                                title: `${libroActual.titulo}`,
                                subtitle: `${notifAutores}`,
                                message: `Se ha guardado como favorito`,
                                media: `<img width="44" height="44" style="border-radius:100%" src="${libroActual.portada}">`
                            });                 

                        }).catch(function(err) {
                            // This code runs if there were any errors
                            console.log(err);
                        });                    
                } else {
                    libros_favoritos.removeItem(libroActual.id).then(function() {
                        console.log('Eliminado');
                        myApp.addNotification({
                            title: `${libroActual.titulo}`,
                            subtitle: `${notifAutores}`,
                            message: `Se ha eliminado de favoritos`,
                            media: `<img width="44" height="44" style="border-radius:100%" src="${libroActual.portada}">`
                        });                        
                    }).catch(function(err) {
                        // This code runs if there were any errors
                        console.log(err);
                    });                    
                }                
            });

});            



// Inserta el templateLibro en el div con id ficha
$$(document).on('click','#ficha', function (e) {
    $$('#ficha').html(templateLibro);
});


// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

myApp.onPageInit('favoritos', function (page) {
    let templateLibrosFavoritos=`
        <div class="card">
        <div class="card-content">
        <div class="list-block media-list">
        <ul>
    `;
    //redirigir a las fichas al tocarlas
    libros_favoritos.iterate(function(value, key, iterationNumber) {
        autores=value.autor;
        let templateAutorLibro='';
            autores.forEach(function(autor) {
            templateAutorLibro+=`
                <p>${autor.nombre} ${autor.apellido}</p>
            `;
        });

        templateLibrosFavoritos+=`
            <li class="item-content">
              <div class="item-media">
                <img src="${value.portada}" width="44">
              </div>
              <a id="${key}" class="ficha-favorita item-link item-content" href="ficha.html">
                  <div class="item-inner">
                    <div class="item-title-row">
                      <div class="item-title">${value.titulo}</div>
                    </div>
                    <div class="item-subtitle">${templateAutorLibro}</div>
                  </div>
              </a>
            </li>            
        `;
        console.log([key, value]);
        console.log(key);
    }).then(function() {
        templateLibrosFavoritos+=`
            </ul>
            </div>
            </div>
        `;
        $$('#favoritos').html(templateLibrosFavoritos);
        
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });

})

$$(document).on('click','.ficha-favorita',function(){
            libros_favoritos.getItem(this.id, function(err, value) {
                insertarFicha(value);
                console.log(value);
            });            
           
        })

myApp.onPageInit('historial', function (page) {
    // Do something here for "about" page
        num_claves=0;
        let templateHistorial=`
            <div class="card">
            <div class="card-content">
            <div class="list-block">
            <ul>
        `;
        
        historial.keys().then(function (keys) {
            num_claves=keys.length;
            console.log(keys);
            historial.iterate(function(value, key, iterationNumber) {
                //iterationNumber=num_claves-3;
                //console.log(iterationNumber);
                if (iterationNumber > num_claves-5) {
                    templateHistorial+=`
                        <li>
                          <a id="${key}" class="item-link item-content buscar back link" href="#">
                            <div class="item-inner">
                              <div class="item-title">${key}</div>
                            </div>
                          </a>
                        </li>
                    `;
                    //console.log([key, value]);
                }
            }).then(function(result) {
                templateHistorial+=`
                    </ul>
                    </div>
                    </div>
                    </div>
                `;
                $$('#historial').html(templateHistorial);
            }).catch(function(err) {
                // This code runs if there were any errors
                console.log(err);
            });
        });


                
        //insertarHistorial(templateHistorial);
})

//la clase buscar
$$('.pages').on('click','.buscar', function(e){
    console.log('rebuscar');
    console.log(this.id);
    var rebuscar=this.id;
    setTimeout(function(){
        $('#busqueda').val(rebuscar);
    },500);
    console.log('listo');
});

myApp.onPageInit('ficha', function (page) {
    //console.log('ficha');

})
// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
})



// cuando se inicia la pagina de ficha, hace esto
// $$(document).on('pageInit', '.page[data-page="ficha"]', function (e) {
    
// })

window.libroActual;
