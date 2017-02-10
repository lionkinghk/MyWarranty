$(document).ready(function(){
                  
  var myDB;
  var categoryListID = '#categoryList';
  var productListID = '#productList';
  var busyID = '#busy';
  var newImageURL;
  var localFolder = 'localImage';
  var defaultImage = 'img/camera-black.svg';


  document.addEventListener("deviceready",onDeviceReady,false);

       function onDeviceReady(){
                  myDB = window.sqlitePlugin.openDatabase({name: "myAssets.db", location: 'default'});
                  myDB.transaction(createTables, transactionError);
                  // myDB.transaction(populateTables, transactionError);
                  myDB.transaction(getCategories, transactionError);
                  $('#categoryHeader').show();
                  $('#productHeader').hide();

        };
                  
                  function transactionError(tx, error) {
                    $(busyID).hide();
                    alert("Database Error: " + error);
                  };

                  function createTables(tx){
                    console.log("Table created start...");
                    tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id integer primary key, category text, imageFile text)');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS products (id integer primary key, cid integer, name text, vendor text, manufacturer text, product text, model text, price real, purchase text, expiry text, alert integer, imageFile text)');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS documents (id integer primary key, pid integer, title text, imageFile text)');
                    console.log("Table created successfully");
                  };

                  function populateTables(tx) {
                    console.log("Table population start...");
                    tx.executeSql("INSERT INTO products (cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,imageFile) VALUES (3,'for3-1','vendor','manufacturer','product','model',100.4,'2017-01-02','2019-01-02',0,'img/camera-black.svg')");
                    tx.executeSql("INSERT INTO products (cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,imageFile) VALUES (3,'for3-2','vendor2','manufacturer2','product2','model2',102.4,'2005-01-02','2006-01-02',0,'img/camera-black.svg')");
                    console.log("Table population successfully");
                  };

                  function refreshListview(listID) {
                     $(listID).listview('refresh');
                  };

                  function getCategories(tx) {
                    console.log("getCategories start...");
                    var sql = "select id, category, imageFile from categories order by category desc";
                    tx.executeSql(sql, [], getCategoriesSuccess);
                    console.log("getCategories population successfully");
                  };

                  function getCategoriesSuccess(tx, results) {
                    $(busyID).hide();
                    var len = results.rows.length;
                    for (var i=0; i<len; i++) {
                      var categories = results.rows.item(i);
                      appendToCategories(categories.id,categories.category,'cdvfile://localhost/persistent' + categories.imageFile);
                    };
                    refreshListview(categoryListID);
                  };

                  function appendToCategories(id, category, imageFile){
                    $(categoryListID).prepend('<li class="category"><a href="#" class="listProducts" id="cat'+id+'" cid="'+id+'">' +
                                             '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\''+defaultImage+'\';" />' +
                                             category + '</a></li>');
                  };

                  $('#insertCategory').click(function(){
                                             var newCategory=$('#newCategory').val();
                                             var newImage=$('#newImage').attr('src');
                                             var d = new Date();
                                             var n = d.getTime();
                                             newImageURL = n + ".jpg";
                                             var lastrowid;
                                             if (newImage != defaultImage)
                                             {
                                               movePic(newImage);
                                             }
                                             var newImageFile = '/' + localFolder + '/' + newImageURL;
                                             myDB.transaction(function(transaction) {
                                                              var executeQuery = "INSERT INTO categories (category, imageFile) VALUES (?,?)";
                                                              transaction.executeSql(executeQuery, [newCategory,newImageFile]
                                                                                     ,
                                                                                     function(tx, result) {
                                                                                            lastrowid = result.insertId;
                                                                                            alert('Added id='+ lastrowid +'! Cancel to close.');
                                                                                     },
                                                                                     transactionError);
                                                              });
                                             appendToCategories(lastrowid,newCategory,newImage);
                                             refreshListview(categoryListID);
                                             $('#newImage').attr('src',defaultImage);
                                             $('#newCategory').val('');

                           });

                  function getProducts(tx, cid) {
                    console.log("getProducts start...");
                    var sql = "select id,cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,imageFile from products where cid = ? order by name desc";
                    tx.executeSql(sql, [cid], getProductsSuccess);
                    console.log("getProducts population successfully");
                  };

                  function getProductsSuccess(tx, results) {
                    $(busyID).hide();
                    var len = results.rows.length;
                    for (var i=0; i<len; i++) {
                      var products = results.rows.item(i);
                      appendToProducts(products.id, products.cid,products.name,products.vendor,products.manufacturer,products.product,products.model,products.price,products.purchase,products.expiry,products.alert,'cdvfile://localhost/persistent' + products.imageFile);
                    };
                    refreshListview(categoryListID);
                  };
                  
                  function appendToProducts(id, cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,imageFile){
                    $(categoryListID).prepend('<li class="product"><a href="#" class="ProductDetails" id="product'+id+'" pid="'+id+'" cid="'+cid+'">' +
                                             '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\''+defaultImage+'\';" />' +
                                             '<h1>'+name+'</h1><p>'+manufacturer+'</p><p>'+product+ ' ' +model+'</p><p>'+purchase + ' ' + expiry+'</p></a></li>');
                  };

                  $(categoryListID).on('click','.listProducts',function() {
                     alert('appointment='+$('#appointment'));
                     $('.category').hide();
                     $('#categoryHeader').hide();
                     $('#productHeader').show();
                     $(busyID).show();
                     var cid = $(this).attr('cid');
                     myDB.transaction(function(tx){getProducts(tx,cid)}, transactionError);
                  });

                  $('#back').click(function(){
                                    $('#categoryHeader').show();
                                    $('#productHeader').hide();
                                    $('.category').show();
                                    $('.product').remove();
                  });




                  
                  $('#newImage').click(function() {
                                        navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
                                                                    destinationType: Camera.DestinationType.FILE_URI,
                                                                    sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                                                    allowEdit : true,
                                                                    encodingType: Camera.EncodingType.JPEG,
                                                                    saveToPhotoAlbum: false
                                                                    });
                                        });
                  function onSuccess(imageData) {
                     $('#newImage').attr('src',imageData);
                   };
                  
                  function onFail(message) {
                    alert('Failed because: ' + message);
                  };
                  function movePic(file){
                    window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
                  }
                  
                  //Callback function when the file system uri has been resolved
                  function resolveOnSuccess(entry){
                  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
                                           //The folder is created if doesn't exist
                                           fileSys.root.getDirectory( localFolder,
                                                                     {create:true, exclusive: false},
                                                                     function(directory) {
                                                                     entry.moveTo(directory, newImageURL,  successMove, resOnError);
                                                                     },
                                                                     resOnError);
                                           },
                                           resOnError);
                  }
                  
                  //Callback function when the file has been moved successfully - inserting the complete path
                  function successMove(entry) {
                    // reaload image after save
                  }
                  
                  function resOnError(error) {
                  alert(error.code);
                  }

                  
});

