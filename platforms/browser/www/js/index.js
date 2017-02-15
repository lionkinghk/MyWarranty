// region contants
const DATA_LIST_ID = '#dataListview';
const BUSY_DIV_ID = '#busyDiv';
const SAVE_SETTINGS_LINK_ID = '#saveSettingsLink';
const EDIT_SETTINGS_POPUP_ID = '#editSettingsPopup';
const SHOW_PRODUCT_POPUP_ID = '#showProductPopup';
const BACK_LINK_ID = '#backLink';
const ADD_PRODUCT_LINK_ID = '#addProductLink';
const ADD_PRODUCT_FORM_ID = '#addProductForm';
const CATEGORY_NAME_H3_ID = '#categoryNameH3';
const CATEGORY_HEADER_ID = '#categoryHeader';
const PRODUCT_HEADER_ID = '#productHeader';
const INSERT_CATEGORY_LINK_ID = '#insertCategoryLink';
const INSERT_PRODUCT_LINK_ID = '#insertProductLink';
const DELETE_CATEGORY_LINK_ID = '#deleteCategoryLink';
const NEW_CATEGORY_INPUT_ID = '#newCategoryInput';
const NEW_CID_INPUT_ID = '#newCIdInput';
const NEW_CATEGORY_IMAGE_SRC_ID = '#newCategoryImageSrc';
const NEW_PRODUCT_IMAGE_SRC_ID = '#newProductImageSrc';
const NEW_PURCHASE_INPUT_ID = '#newPurchaseInput';
const NEW_EXPIRY_INPUT_ID = '#newExpiryInput';
const NEW_NAME_INPUT_ID = '#newNameInput';
const NEW_VENDOR_INPUT_ID = '#newVendorInput';
const NEW_MANUFACTURER_INPUT_ID = '#newManufacturerInput';
const NEW_PRUDUCT_INPUT_ID = '#newProductInput';
const NEW_PRICE_INPUT_ID = '#newPriceInput';
const NEW_MODEL_INPUT_ID = '#newModelInput';
const NEW_ALERT_SELECT_ID = '#newAlertSelect';
const NEW_SERIAL_INPUT_ID = '#newSerialInput';
const NEW_NOTE_TEXTAREA_ID = '#newNoteTextarea';
const SHOW_EXPIRY_SELECT_ID = '#showExpirySelect';
const ALLOW_ALERT_SELECT_ID = '#allowAlertSelect';
const PRODUCT_DETAILS_PARA_ID = '#productDetailsPara';
const DOCUMENTS_TABLE_ID = '#documentsTable';
const NEW_IMAGE_SRC_CLASS = '.newImageSrc';
const CATEGORY_LIST_CLASS = '.categoryList';
const PRODUCT_LIST_CLASS = '.productList';
const LIST_PRODUCT_LINK_CLASS = '.listProductLink';
const LIST_PRODUCT_DETAILS_LINK_CLASS = '.listProductDetails';
const DATABASE_NAME = 'MyWarranty.db';
const TABLES_CREATE_QUERY = ['CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, category TEXT, imageFile TEXT)',
    'CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, cid INTEGER, name TEXT, vendor TEXT, manufacturer TEXT, product TEXT, model TEXT, price REAL, purchase TEXT, expiry TEXT, alert TEXT, serial TEXT, note TEXT, imageFile TEXT)',
    'CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY, pid INTEGER, title TEXT, imageFile TEXT)'];
const CATEGORIES_TABLE_FIELDS = ' category,imageFile '; // without id
const PRODUCTS_TABLE_FIELDS = ' cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,serial,note,imageFile '; // without id
const DOCUMENTS_TABLE_FIELDS = ' pid,title,imagefile '; // without id
const LOCAL_IMAGE_FOLDER = 'localImage';
const DEFAULT_IMAGE = 'img/camera-black.svg';
const CDVFILE_LOCATION = 'cdvfile://localhost/persistent';
const DATEPICKER_DATEFORMAT = 'mm/dd/yy';
const DB_STORE_DATEFORMAT = 'yymmdd';
// endregion

// region global variables
var gDB;
var gLocalStorage;
// endregion

// region document ready
$(document).ready(function () {

    document.addEventListener('deviceready', onDeviceReady, false);
    function onDeviceReady() {
        // application settings
        gLocalStorage = window.localStorage;
        loadSettings();

        // database setup
        gDB = window.sqlitePlugin.openDatabase({name: DATABASE_NAME, location: 'default'});
        gDB.transaction(createTables, transactionError);
        // gDB.transaction(populateTables, transactionError);

        // category list population
        gDB.transaction(getCategories, transactionError);
        showHome();

    };
});
// endregion

// region Settings
function loadSettings() {
    $(SHOW_EXPIRY_SELECT_ID).val(getShowExpiry()).change();
    $(ALLOW_ALERT_SELECT_ID).val(getAllowAlert()).change();
}

function getShowExpiry() {
    return gLocalStorage.getItem(SHOW_EXPIRY_SELECT_ID);
}

function getAllowAlert() {
    return gLocalStorage.getItem(ALLOW_ALERT_SELECT_ID);
}

$(SAVE_SETTINGS_LINK_ID).click(function () {
    gLocalStorage.setItem(ALLOW_ALERT_SELECT_ID, $(ALLOW_ALERT_SELECT_ID).val());
    gLocalStorage.setItem(SHOW_EXPIRY_SELECT_ID, $(SHOW_EXPIRY_SELECT_ID).val());
    alert('Settings Saved!');
    $(EDIT_SETTINGS_POPUP_ID).popup('close');
});
// endregion

// region database table
function transactionError(transaction, error) {
    $(BUSY_DIV_ID).hide();
    alert('Database Error: ' + error.code + '/' + error.message);
};

function createTables(transaction) {
    console.log('Table created start...');
    TABLES_CREATE_QUERY.forEach(function (query) {
        transaction.executeSql(query);
    });
    console.log('Table created successfully');
};

function populateTables(transaction) {
    console.log('Table population start...');
    transaction.executeSql('INSERT INTO documents (' + DOCUMENTS_TABLE_FIELDS + ') VALUES (1,"for3-1","img/camera-black.svg")');
    transaction.executeSql('INSERT INTO documents (' + DOCUMENTS_TABLE_FIELDS + ') VALUES (1,"for3-2","img/camera-black.svg")');
    console.log('Table population successfully');
};

// endregion

// region categories

function refreshListview(listviewID) {
    $(listviewID).listview('refresh');
};

function getCategories(transaction) {
    console.log('getCategories start...');
    var executeQuery = 'SELECT id, ' + CATEGORIES_TABLE_FIELDS + ' FROM categories ORDER BY category';
    transaction.executeSql(executeQuery, [], getCategoriesSuccess);
    console.log('getCategories population successfully.');
};

function getCategoriesSuccess(transaction, results) {
    var length = results.rows.length;
    for (var iCount = 0; iCount < length; iCount++) {
        var categories = results.rows.item(iCount);
        $(DATA_LIST_ID).append(formatCategory(categories.id, categories.category, CDVFILE_LOCATION + categories.imageFile));
    }
    $(BUSY_DIV_ID).hide();
    refreshListview(DATA_LIST_ID);
};

function formatCategory(id, category, imageFile) {
    alert('format id:' +id)
    return '<li class="categoryList"><a href="#" class="listProductLink" id="cat' + id + '" cid="' + id + '" category="' + category + '">' +
        '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\'' + DEFAULT_IMAGE + '\';" />' +
        category + '</a></li>';
};

$(INSERT_CATEGORY_LINK_ID).click(function () {
    var newCategory = $(NEW_CATEGORY_INPUT_ID).val();
    var newImage = $(NEW_CATEGORY_IMAGE_SRC_ID).attr('src');
    var today = new Date();
    var newImageURL = today.getTime() + ".jpg";
    var lastRowID;
    if (newImage != DEFAULT_IMAGE) {
        copyPictureToApps(newImage, newImageURL);
    }
    var newImageFile = '/' + LOCAL_IMAGE_FOLDER + '/' + newImageURL;
    gDB.transaction(function (transaction) {
        var executeQuery = 'INSERT INTO categories (' + CATEGORIES_TABLE_FIELDS + ') VALUES (?,?)';
        transaction.executeSql(executeQuery, [newCategory, newImageFile]
            ,
            function (transaction, result) {
                lastRowID = result.insertId;
                $(DATA_LIST_ID + ' li:eq(0)').after(formatCategory(lastRowID, newCategory, newImage));
                refreshListview(DATA_LIST_ID);
                alert('Added ' + newCategory + '(' + lastRowID + ')! Click [Cancel] to close.');
            },
            transactionError);
    });
    $(NEW_IMAGE_SRC_ID).attr('src', DEFAULT_IMAGE);
    $(NEW_CATEGORY_INPUT_ID).val('');

});

$(DELETE_CATEGORY_LINK_ID).click(function () {
    var cid = $(DELETE_CATEGORY_LINK_ID).attr('cid');
    var category = $(DELETE_CATEGORY_LINK_ID).attr('category');
    var confirmDelete = confirm('Confirm to delete category [' + category + ']('+cid+')');
    if (confirmDelete == true) {
        try {
         gDB.transaction(function (transaction) {transaction.executeSql('DELETE FROM categories WHERE id =  ?' , [cid]);});
         } catch(err) {
            alert('err:' + err.message);
         }
         $('#cat'+cid).parent().remove(CATEGORY_LIST_CLASS);
        alert('Category [' + category + '] deleted!');
        showHome();
    }
});

function showDeleteCategoryLink(cid,category) {
    $(DELETE_CATEGORY_LINK_ID).attr('cid', cid);
    $(DELETE_CATEGORY_LINK_ID).attr('category', category);
    $(DELETE_CATEGORY_LINK_ID).show();
}

// endregion

// region products
function getProducts(transaction, cid, category) {
    console.log('getProducts start...');
    showDeleteCategoryLink(cid,category);
    var executeQuery = 'SELECT id,' + PRODUCTS_TABLE_FIELDS + ' FROM products ';
    var queryParameters = [];
    var addConditionConnectString = ' WHERE ';
    if (cid != '0') {
        executeQuery = executeQuery + addConditionConnectString + " cid = ? ";
        queryParameters = [cid];
        addConditionConnectString = ' AND ';
    }
    ;
    if (getShowExpiry() == "off") {
        var todayYYYYMMDD = $.datepicker.formatDate(DB_STORE_DATEFORMAT, new Date());
        executeQuery = executeQuery + addConditionConnectString + ' expiry >= "' + todayYYYYMMDD + '"';
    }
    ;
    executeQuery = executeQuery + ' ORDER BY name desc';
    transaction.executeSql(executeQuery, queryParameters, getProductsSuccess);
    console.log('getProducts population successfully.');
};

function getProductsSuccess(transaction, results) {
    $(BUSY_DIV_ID).hide();
    var length = results.rows.length;
    if (length > 0) {
        $(DELETE_CATEGORY_LINK_ID).hide();
        for (var i = 0; i < length; i++) {
            var products = results.rows.item(i);
            appendToProducts(products.id, products.cid, products.name, products.vendor, products.manufacturer, products.product, products.model, products.price, products.purchase, products.expiry, products.alert, products.serial, products.note, CDVFILE_LOCATION + products.imageFile);
        }
    }
    ;
    refreshListview(DATA_LIST_ID);
};

function appendToProducts(id, cid, name, vendor, manufacturer, product, model, price, purchase, expiry, alert, serial, note, imageFile) {
    $(DATA_LIST_ID).prepend('<li class="productList"><a href="#" class="listProductDetails" id="product' + id + '" pid="' + id + '" cid="' + cid  + '" ">' +
        '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\'' + DEFAULT_IMAGE + '\';" />' +
        '<h1>' + name + '</h1><p>' + manufacturer + '</p><p>' + product + ' ' + model + '</p><p>' + parseDateToDisplay(purchase) + ' ' + parseDateToDisplay(expiry) + '</p></a></li>');
};

$(DATA_LIST_ID).on('click', LIST_PRODUCT_LINK_CLASS, function () {
    var category = $(this).attr('category');
    $(CATEGORY_NAME_H3_ID).html(category);
    $(CATEGORY_LIST_CLASS).hide();
    $(CATEGORY_HEADER_ID).hide();
    $(PRODUCT_HEADER_ID).show();
    $(BUSY_DIV_ID).show();
    var cid = $(this).attr('cid');
    $(NEW_CID_INPUT_ID).val(cid);
    gDB.transaction(function (transaction) {
        getProducts(transaction, cid, category)
    }, transactionError);
    if (cid == 0) {
        $(ADD_PRODUCT_LINK_ID).hide();
    }
    else {
        $(ADD_PRODUCT_LINK_ID).show();
    }
});

$(DATA_LIST_ID).on('click', LIST_PRODUCT_DETAILS_LINK_CLASS, function () {
    var category = $(CATEGORY_NAME_H3_ID).html();
    var pid = $(this).attr('pid');
    alert('Product Details Link clicked!');
    var executeQuery = 'SELECT id,' + PRODUCTS_TABLE_FIELDS + ' FROM products WHERE id = ? ';
    gDB.transaction(function (transaction) {transaction.executeSql(executeQuery , [pid]);},getProductDetailsSuccess);
    var executeQuery = 'SELECT id,' + DOCUMENTS_TABLE_FIELDS + ' FROM documents WHERE pid = ? ';
    gDB.transaction(function (transaction) {transaction.executeSql(executeQuery , [pid]);},getDocumentsSuccess);
    $(SHOW_PRODUCT_POPUP_ID).popup('open');

});

function getProductDetailsSuccess(transaction, results) {
    var product = results.rows.item(0);
    var html ='<img src="' + product.Imagefile +'">';
        html =+ "name:" + product.name + "</br>";
    html =+ "vendor:" + product.vendor + "</br>";
    html =+ "manufacturer:" + product.manufacturer + "</br>";
    html =+ "product:" + product.product + "</br>";
    html =+ "price:" + product.price + "</br>";
    html =+ "purchase:" + product.purchase + "</br>";
    html =+ "expiry:" + product.expiry + "</br>";
    html =+ "alert:" + product.alert + "</br>";
    html =+ "serial:" + product.serial + "</br>";
    html =+ "note:" + product.note + "</br>";
    alert('html:' + html);
    $(PRODUCT_DETAILS_PARA_ID).html(html);
}

function getDocumentsSuccess(transaction, results) {
    var length = results.rows.length;
    const classBlock = ['ui-block-a','ui-block-b','ui-block-c','ui-block-d','ui-block-e'];
    var htmlTable = '<tr>';
    if (length > 0) {
        for (var iRow = 0; iRow < length; iRow++) {
            var document = results.rows.item(iRow);
            htmlTable =+ '<td>' + '<img src="' + document.Imagefile +'" id="'+ document.id+ '" ></br>' + document.title + '</td>';
            if ((iRow % 5) == 0)
            {
                htmlTable =+ '</tr>';        
            }
        }
    }
    if ((length % 5) != 0) {
        htmlTable =+ '</tr>';
    }
    ;
    alert('htmlTable:' + htmlTable);
    $(DOCUMENTS_TABLE_ID).empty();
    $(DOCUMENTS_TABLE_ID + ' tbody' ).append(htmlTable);
}


// endregion

// region product forms

$(INSERT_PRODUCT_LINK_ID).click(function () {
    var newcid = $(NEW_CID_INPUT_ID).val();
    var newName = $(NEW_NAME_INPUT_ID).val();
    var newVendor = $(NEW_VENDOR_INPUT_ID).val();
    var newManufacturer = $(NEW_MANUFACTURER_INPUT_ID).val();
    var newProduct = $(NEW_PRUDUCT_INPUT_ID).val();
    var newModel = $(NEW_MODEL_INPUT_ID).val();
    var newPrice = $(NEW_PRICE_INPUT_ID).val();
    var newPurchase = parseDateToDBStore($(NEW_PURCHASE_INPUT_ID).val());
    var newExpiry = parseDateToDBStore($(NEW_EXPIRY_INPUT_ID).val());
    var newAlert = $(NEW_ALERT_SELECT_ID).val();
    var newSerial = $(NEW_SERIAL_INPUT_ID).val();
    var newNote = $(NEW_NOTE_TEXTAREA_ID).val();
    var newImage = $(NEW_PRODUCT_IMAGE_SRC_ID).attr('src');
    var today = new Date();
    var newImageURL = today.getTime() + ".jpg";
    var lastRowID;
    if (newImage != DEFAULT_IMAGE) {
        copyPictureToApps(newImage, newImageURL);
    }
    var newImageFile = '/' + LOCAL_IMAGE_FOLDER + '/' + newImageURL;
    gDB.transaction(function (transaction) {
        var executeQuery = 'INSERT INTO products (' + PRODUCTS_TABLE_FIELDS + ') VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
        transaction.executeSql(executeQuery, [newcid, newName, newVendor, newManufacturer, newProduct, newModel, newPrice, newPurchase, newExpiry, newAlert, newSerial, newNote, newImageFile]
            ,
            function (transaction, result) {
                lastRowID = result.insertId;
                alert('Added ' + newName + '(' + lastRowID + ')! Click [Cancel] to close.');
            },
            transactionError);
    });
    appendToProducts(lastRowID, newcid, newName, newVendor, newManufacturer, newProduct, newModel, newPrice, newPurchase, newExpiry, newAlert, newSerial, newNote, newImage);
    refreshListview(DATA_LIST_ID);
    $(NEW_PRODUCT_IMAGE_SRC_ID).attr('src', DEFAULT_IMAGE);
    $(ADD_PRODUCT_FORM_ID).trigger('reset');
    $(NEW_CID_INPUT_ID).val(newcid);

});

function showHome() {
    $(CATEGORY_HEADER_ID).show();
    $(PRODUCT_HEADER_ID).hide();
    $(CATEGORY_LIST_CLASS).show();
    $(PRODUCT_LIST_CLASS).remove();
    $(DELETE_CATEGORY_LINK_ID).hide();
    refreshListview(DATA_LIST_ID);
};

$(BACK_LINK_ID).click(function () {
    showHome();
});

$(function () {
    $(NEW_PURCHASE_INPUT_ID).datepicker();
});

$(function () {
    $(NEW_EXPIRY_INPUT_ID).datepicker();
});

// endregion

// region Picture

$(NEW_IMAGE_SRC_CLASS).click(function () {
    var imageSrcId = $(this).attr('id');
    navigator.camera.getPicture(function (imageData) {
        getPictureOnSuccess(imageData,imageSrcId)
    }, getPictureOnFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        saveToPhotoAlbum: false
    });
});

function getPictureOnSuccess(imageData, imageSrcId) {
    $('#'+imageSrcId).attr('src', imageData);
};

function getPictureOnFail(message) {
    alert('Picture/Camera failed because: ' + message);
};

// endregion

// region Files

function copyPictureToApps(file, newImageURL) {
    window.resolveLocalFileSystemURI(file, function (entry) {
        resolveOnSuccess(entry, newImageURL)
    }, resolveOnError);
}

//Callback function when the file system uri has been resolved
function resolveOnSuccess(entry, newImageURL) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
            //The folder is created if doesn't exist
            fileSys.root.getDirectory(LOCAL_IMAGE_FOLDER,
                {create: true, exclusive: false},
                function (directory) {
                    entry.moveTo(directory, newImageURL, copyOnSuccess, copyOnError);
                },
                resolveOnError);
        },
        resolveOnError);
}

//Callback function when the file has been moved successfully - inserting the complete path
function copyOnSuccess(entry) {
    // reaload image after save
}

function resolveOnError(error) {
    alert("Fail to resolve file: " + error.code);
}

function copyOnError(error) {
    alert("Fail to copy file: " + error.code);
}


// endregion

// region Utilities
function parseDateToDBStore(inputDate) {
    try {
      if (inputDate != '') {
        return $.datepicker.formatDate(DB_STORE_DATEFORMAT, $.datepicker.parseDate(DATEPICKER_DATEFORMAT, inputDate))
      }
    } catch(err) {}
    return inputDate;
}

function parseDateToDisplay(inputDate) {
    try {
      if (inputDate != '') {
        return $.datepicker.formatDate(DATEPICKER_DATEFORMAT, $.datepicker.parseDate(DB_STORE_DATEFORMAT, inputDate))
      }
    } catch(err){}
    return inputDate;
}
// endregion