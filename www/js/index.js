$(document).ready(function(){

// contants
  var categoryListID = '#categoryList';
  var productListID = '#productList';
  var busyID = '#busy';
  var localFolder = 'localImage';
  var defaultImage = 'img/camera-black.svg';
  var showExpiryID = "showExpiry";
  var allowAlertID = "allowAlert";
  var showExpirySQL = "  and expiry > ";

// global variables
  var myDB;
  var myLocalStorage;
  var newImageURL;
  var showExpiry;
  var allowAlert;

  document.addEventListener("deviceready",onDeviceReady,false);

       function onDeviceReady(){
                // application settings
                  myLocalStorage = window.localStorage;
                  setSettings();

                // category list populate
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
                    tx.executeSql('CREATE TABLE IF NOT EXISTS products (id integer primary key, cid integer, name text, vendor text, manufacturer text, product text, model text, price real, purchase text, expiry text, alert text, serial text, note text, imageFile text)');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS documents (id integer primary key, pid integer, title text, imageFile text)');
                    console.log("Table created successfully");
                  };

                  function populateTables(tx) {
                    console.log("Table population start...");
                    tx.executeSql("INSERT INTO products (cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert, serial, note, imageFile) VALUES (1,'for3-1','vendor','manufacturer','product','model',100.4,'2017-01-02','2019-01-02','on','xxx-yyy-zz','this ok','img/camera-black.svg')");
                    tx.executeSql("INSERT INTO products (cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert, serial, note, imageFile) VALUES (1,'for3-2','vendor2','manufacturer2','product2','model2',102.4,'2005-01-02','2006-01-02','off','aaa-bbb-cc','this ok','img/camera-black.svg')");
                    console.log("Table population successfully");
                  };

function setSettings() {
                  showExpiry = myLocalStorage.getItem(showExpiryID);
                  allowAlert = myLocalStorage.getItem(allowAlertID);
                  $('#showExpiry').val(showExpiry).change();
                  $('#allowAlert').val(allowAlert).change();
}

$('#saveSettings').click(function() {
                    myLocalStorage.setItem(allowAlertID,$('#allowAlert').val());
                    myLocalStorage.setItem(showExpiryID,$('#showExpiry').val());
                  showExpiry = myLocalStorage.getItem(showExpiryID);
                  allowAlert = myLocalStorage.getItem(allowAlertID);
                  alert('Saved!');
                  $('#editSettings').popup("close");

});

                  function refreshListview(listID) {
                     $(listID).listview('refresh');
                  };

                  function getCategories(tx) {
                    console.log("getCategories start...");
                    var sql = "select id, category, imageFile from categories order by category";
                    tx.executeSql(sql, [], getCategoriesSuccess);
                    console.log("getCategories population successfully");
                  };

                  function getCategoriesSuccess(tx, results) {
                    $(busyID).hide();
                    var len = results.rows.length;
                    for (var i=0; i<len; i++) {
                      var categories = results.rows.item(i);
                      $(categoryListID).append(formatCategory(categories.id,categories.category,'cdvfile://localhost/persistent' + categories.imageFile));
                    };
                    refreshListview(categoryListID);
                  };

                  function formatCategory(id, category, imageFile){
                     return '<li class="category"><a href="#" class="listProducts" id="cat'+id+'" cid="'+id+'" category="'+ category +'">' +
                                             '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\''+defaultImage+'\';" />' +
                                             category + '</a></li>';
                  };

                  $('#insertCategory').click(function(){
                                             var newCategory=$('#newCategory').val();
                                             var newImage=$('#newImage').attr('src');
                                             var d = new Date();
                                             var n = d.getTime();
                                             newImageURL = n + ".jpg";
                                             var lastRowID;
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
                                                                                            lastRowID = result.insertId;
                                                                                            alert('Added ' + newCategory + '('+ lastRowID +')! Click [Cancel] to close.');
                                                                                     },
                                                                                     transactionError);
                                                              });
                                             $(categoryListID + ' li:eq(0)').after(formatCategory(lastRowID,newCategory,newImage));
                                             refreshListview(categoryListID);
                                             $('#newImage').attr('src',defaultImage);
                                             $('#newCategory').val('');

                   });

                  function getProducts(tx, cid) {
                    console.log("getProducts start...");
                    if (cid == 0)
                    {
                      var sql = "select id,cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,serial,note,imageFile from products where 1 = 1 order by name desc";
                      tx.executeSql(sql, [], getProductsSuccess);
                    }
                    else
                    {
                      var sql = "select id,cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,serial,note,imageFile from products where cid = ? order by name desc";
                      tx.executeSql(sql, [cid], getProductsSuccess);
                    }
                    console.log("getProducts population successfully");
                  };

                  function getProductsSuccess(tx, results) {
                    $(busyID).hide();
                    var len = results.rows.length;
                    for (var i=0; i<len; i++) {
                      var products = results.rows.item(i);
                      appendToProducts(products.id, products.cid,products.name,products.vendor,products.manufacturer,products.product,products.model,products.price,products.purchase,products.expiry,products.alert,products.serial,products.note, 'cdvfile://localhost/persistent' + products.imageFile);
                    };
                    refreshListview(categoryListID);
                  };
                  
                  function appendToProducts(id, cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,serial,note,imageFile){
                    $(categoryListID).prepend('<li class="product"><a href="#" class="ProductDetails" id="product'+id+'" pid="'+id+'" cid="'+cid+'">' +
                                             '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\''+defaultImage+'\';" />' +
                                             '<h1>'+name+'</h1><p>'+manufacturer+'</p><p>'+product+ ' ' +model+'</p><p>'+purchase + ' ' + expiry+'</p></a></li>');
                  };

                  $(categoryListID).on('click','.listProducts',function() {
                     $('#categoryName').html($(this).attr('category'));
                     $('.category').hide();
                     $('#categoryHeader').hide();
                     $('#productHeader').show();
                     $(busyID).show();
                     var cid = $(this).attr('cid');
                     $('#newcid').val(cid);
                     myDB.transaction(function(tx){getProducts(tx,cid)}, transactionError);
                                         if (cid == 0)
                                         {
                                            $('#AddProductLink').hide();
                                         }
                                         else
                                         {
                                            $('#AddProductLink').show();
                                         }

                  });

                  $('#insertProduct').click(function(){

                                             var newcid=$('#newcid').val();
                                             var newName=$('#newName').val();
                                             var newVendor=$('#newVendor').val();
                                             var newManufacturer=$('#newManufacturer').val();
                                             var newProduct=$('#newProduct').val();
                                             var newModel=$('#newModel').val();
                                             var newPrice=$('#newPrice').val();
                                             var newPurchase=$('#newPurchase').val();
                                             var newExpiry=$('#newExpiry').val();
                                             var newAlert=$('#newAlert').val();
                                             var newSerial=$('#newSerial').val();
                                             var newNote=$('#newNote').val();
                                             var newImage=$('#newProductImage').attr('src');
                                             var d = new Date();
                                             var n = d.getTime();
                                             newImageURL = n + ".jpg";
                                             var lastRowID;
                                             if (newImage != defaultImage)
                                             {
                                               movePic(newImage);
                                             }
                                             var newImageFile = '/' + localFolder + '/' + newImageURL;
                                             myDB.transaction(function(transaction) {
                                                              var executeQuery = "INSERT INTO products (cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,serial,note,imageFile) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                                              transaction.executeSql(executeQuery, [newcid,newName,newVendor,newManufacturer,newProduct,newModel,newPrice,newPurchase,newExpiry,newAlert,newSerial,newNote,newImageFile]
                                                                                     ,
                                                                                     function(tx, result) {
                                                                                            lastRowID = result.insertId;
                                                                                            alert('Added ' + newName + '('+ lastRowID +')! Click [Cancel] to close.');
                                                                                     },
                                                                                     transactionError);
                                                              });
                                             appendToProducts(lastRowID, newcid,newName,newVendor,newManufacturer,newProduct,newModel,newPrice,newPurchase,newExpiry,newAlert,newSerial,newNote, 'cdvfile://localhost/persistent' + newImageFile);
                                             refreshListview(categoryListID);
                                             $('#newProductImage').attr('src',defaultImage);
                                             $('#addProductForm').trigger('reset');
                                             $('#newcid').val(newcid);

                   });

                  $('#back').click(function(){
                                    $('#categoryHeader').show();
                                    $('#productHeader').hide();
                                    $('.category').show();
                                    $('.product').remove();
                  });

$( function() {
    $( "#newPurchase" ).datepicker();
  } );

$( function() {
    $( "#newExpiry" ).datepicker();
  } );


                  $('#newProductImage').click(function() {
                                        navigator.camera.getPicture(onProductSuccess, onFail, { quality: 50,
                                                                    destinationType: Camera.DestinationType.FILE_URI,
                                                                    sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
                                                                    allowEdit : true,
                                                                    encodingType: Camera.EncodingType.JPEG,
                                                                    saveToPhotoAlbum: false
                                                                    });
                                        });
                  function onProductSuccess(imageData) {
                     $('#newProductImage').attr('src',imageData);
                   };


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

