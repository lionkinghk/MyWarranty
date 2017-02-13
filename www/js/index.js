// region contants
const CATEGORY_LIST_ID = '#categoryListview';
const BUSY_DIV_ID = '#busyDiv';
const SAVE_SETTINGS_POPUP_ID = '#saveSettingsPopup';
const EDIT_SETTINGS_POPUP_ID = '#editSettingsPopup';
const BACK_LINK_ID = '#backLink';
const ADD_PRODUCT_LINK_ID = '#addProductLink';
const ADD_PRODUCT_FORM_ID = '#addProductForm';
const CATEGORY_NAME_H3_ID = '#categoryNameH3';
const CATEGORY_HEADER_ID = '#categoryHeader';
const PRODUCT_HEADER_ID = '#productHeader';
const INSERT_CATEGORY_LINK_ID = '#insertCategoryLink';
const INSERT_PRODUCT_LINK_ID = '#insertProductLink';
const NEW_CATEGORY_INPUT_ID = '#newCategoryInput';
const NEW_CID_INPUT_ID = '#newCIdInput';
const NEW_IMAGE_SRC_ID = '#newImageSrc';
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
const CATEGORY_LIST_CLASS = '.categoryList';
const PRODUCT_LIST_CLASS = '.productList';
const LIST_PRODUCT_LINK_CLASS = '.listProductLink';
const DATABASE_NAME = 'MyWarranty.db';
const PRODUCT_TABLE_FIELDS = 'cid,name,vendor,manufacturer,product,model,price,purchase,expiry,alert,serial,note,imageFile'; // without id
const CATEGORY_TABLE_FIELDS = 'category, imageFile'; // without id
const LOCAL_IMAGE_FOLDER = 'localImage';
const DEFAULT_IMAGE = 'img/camera-black.svg';
const CDVFILE_LOCATION = 'cdvfile://localhost/persistent';
// endregion

// region global variables
var gDB;
var gLocalStorage;
var gNewImageURL;
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
        $(CATEGORY_HEADER_ID).show();
        $(PRODUCT_HEADER_ID).hide();

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


$(SAVE_SETTINGS_POPUP_ID).click(function () {
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
    transaction.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, category TEXT, imageFile TEXT)');
    transaction.executeSql('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, cid INTEGER, name TEXT, vendor TEXT, manufacturer TEXT, product TEXT, model TEXT, price REAL, purchase TEXT, expiry TEXT, alert TEXT, serial TEXT, note TEXT, imageFile TEXT)');
    transaction.executeSql('CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY, pid INTEGER, title TEXT, imageFile TEXT)');
    console.log('Table created successfully');
};

function populateTables(transaction) {
    console.log('Table population start...');
    transaction.executeSql('INSERT INTO products (' + PRODUCT_TABLE_FIELDS + ') VALUES (1,"for3-1","vendor","manufacturer","product","model",100.4,"2017-01-02","2019-01-02","on","xxx-yyy-zz","this ok","img/camera-black.svg")');
    transaction.executeSql('INSERT INTO products (' + PRODUCT_TABLE_FIELDS + ') VALUES (1,"for3-2","vendor2","manufacturer2","product2","model2",102.4,"2005-01-02","2006-01-02","off","aaa-bbb-cc","this ok","img/camera-black.svg")');
    console.log('Table population successfully');
};

// endregion

// region categories

function refreshListview(listviewID) {
    $(listviewID).listview('refresh');
};

function getCategories(transaction) {
    console.log('getCategories start...');
    var executeQuery = 'select id, ' + CATEGORY_TABLE_FIELDS + 'from categories order by category';
    transaction.executeSql(executeQuery, [], getCategoriesSuccess);
    console.log('getCategories population successfully.');
};

function getCategoriesSuccess(transaction, results) {
    var length = results.rows.length;
    for (var iCount = 0; iCount < length; iCount++) {
        var categories = results.rows.item(iCount);
        $(CATEGORY_LIST_ID).append(formatCategory(categories.id, categories.category, CDVFILE_LOCATION + categories.imageFile));
    }
    ;
    $(BUSY_DIV_ID).hide();
    refreshListview(CATEGORY_LIST_ID);
};

function formatCategory(id, category, imageFile) {
    return '<li class="categoryList"><a href="#" class="listProductLink" id="cat' + id + '" cid="' + id + '" category="' + category + '">' +
        '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\'' + DEFAULT_IMAGE + '\';" />' +
        category + '</a></li>';
};

$(INSERT_CATEGORY_LINK_ID).click(function () {
    var newCategory = $(NEW_CATEGORY_INPUT_ID).val();
    var newImage = $(NEW_IMAGE_SRC_ID).attr('src');
    var today = new Date();
    gNewImageURL = today.getTime() + ".jpg";
    var lastRowID;
    if (newImage != DEFAULT_IMAGE) {
        movePic(newImage);
    }
    var newImageFile = '/' + LOCAL_IMAGE_FOLDER + '/' + gNewImageURL;
    gDB.transaction(function (transaction) {
        var executeQuery = 'INSERT INTO categories (' + CATEGORY_TABLE_FIELDS + ') VALUES (?,?)';
        transaction.executeSql(executeQuery, [newCategory, newImageFile]
            ,
            function (transaction, result) {
                lastRowID = result.insertId;
                alert('Added ' + newCategory + '(' + lastRowID + ')! Click [Cancel] to close.');
            },
            transactionError);
    });
    $(CATEGORY_LIST_ID + ' li:eq(0)').after(formatCategory(lastRowID, newCategory, newImage));
    refreshListview(CATEGORY_LIST_ID);
    $(NEW_IMAGE_SRC_ID).attr('src', DEFAULT_IMAGE);
    $(NEW_CATEGORY_INPUT_ID).val('');

});

// endregion

// region products
function getProducts(transaction, cid) {
    console.log('getProducts start...');
    var executeQuery = 'select id,' + PRODUCT_TABLE_FIELDS + ' from products ';
    var queryParameters = [];
    var addConditionConnectString = 'where';
    if (cid != 0) {
        executeQuery = executeQuery + addConditionConnectString + " cid = ? ";
        queryParameters = [cid];
        addConditionConnectString = ' and ';
    }
    if (showEpiry = "on") {
        var today = new Date();
        var todayYYYYMMDD = today.format('yyyymmdd');
        executeQuery = executeQuery + addConditionConnectString + ' expiry >= "' + todayYYYYMMDD + ' "';
    }
    executeQuery = executeQuery + ' order by name desc';
    transaction.executeSql(executeQuery, queryParameters, getProductsSuccess);
    console.log('getProducts population successfully.');
};

function getProductsSuccess(transaction, results) {
    $(BUSY_DIV_ID).hide();
    var len = results.rows.length;
    for (var i = 0; i < len; i++) {
        var products = results.rows.item(i);
        appendToProducts(products.id, products.cid, products.name, products.vendor, products.manufacturer, products.product, products.model, products.price, products.purchase, products.expiry, products.alert, products.serial, products.note, CDVFILE_LOCATION + products.imageFile);
    }
    ;
    refreshListview(CATEGORY_LIST_ID);
};

function appendToProducts(id, cid, name, vendor, manufacturer, product, model, price, purchase, expiry, alert, serial, note, imageFile) {
    $(CATEGORY_LIST_ID).prepend('<li class="productList"><a href="#" class="ProductDetails" id="product' + id + '" pid="' + id + '" cid="' + cid + '">' +
        '<img id="img' + id + '" src="' + imageFile + '" onerror="this.onerror=null;this.src=\'' + DEFAULT_IMAGE + '\';" />' +
        '<h1>' + name + '</h1><p>' + manufacturer + '</p><p>' + product + ' ' + model + '</p><p>' + purchase + ' ' + expiry + '</p></a></li>');
};

$(CATEGORY_LIST_ID).on('click', LIST_PRODUCT_LINK_CLASS, function () {
    $(CATEGORY_NAME_H3_ID).html($(this).attr('category'));
    $(CATEGORY_LIST_CLASS).hide();
    $(CATEGORY_HEADER_ID).hide();
    $(PRODUCT_HEADER_ID).show();
    $(BUSY_DIV_ID).show();
    var cid = $(this).attr('cid');
    $(NEW_CID_INPUT_ID).val(cid);
    gDB.transaction(function (transaction) {
        getProducts(transaction, cid)
    }, transactionError);
    if (cid == 0) {
        $(ADD_PRODUCT_LINK_ID).hide();
    }
    else {
        $(ADD_PRODUCT_LINK_ID).show();
    }

});

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
    var newPurchase = $(NEW_PURCHASE_INPUT_ID).val();
    var newExpiry = $(NEW_EXPIRY_INPUT_ID).val();
    var newAlert = $(NEW_ALERT_SELECT_ID).val();
    var newSerial = $(NEW_SERIAL_INPUT_ID).val();
    var newNote = $(NEW_NOTE_TEXTAREA_ID).val();
    var newImage = $(NEW_PRODUCT_IMAGE_SRC_ID).attr('src');
    var today = new Date();
    gNewImageURL = today.getTime() + ".jpg";
    var lastRowID;
    if (newImage != DEFAULT_IMAGE) {
        movePic(newImage);
    }
    var newImageFile = '/' + LOCAL_IMAGE_FOLDER + '/' + gNewImageURL;
    gDB.transaction(function (transaction) {
        var executeQuery = "INSERT INTO products ('+PRODUCT_TABLE_FIELDS +') VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
        transaction.executeSql(executeQuery, [newcid, newName, newVendor, newManufacturer, newProduct, newModel, newPrice, newPurchase, newExpiry, newAlert, newSerial, newNote, newImageFile]
            ,
            function (transaction, result) {
                lastRowID = result.insertId;
                alert('Added ' + newName + '(' + lastRowID + ')! Click [Cancel] to close.');
            },
            transactionError);
    });
    appendToProducts(lastRowID, newcid, newName, newVendor, newManufacturer, newProduct, newModel, newPrice, newPurchase, newExpiry, newAlert, newSerial, newNote, CDVFILE_LOCATION + newImageFile);
    refreshListview(CATEGORY_LIST_ID);
    $(NEW_PRODUCT_IMAGE_SRC_ID).attr('src', DEFAULT_IMAGE);
    $(ADD_PRODUCT_FORM_ID).trigger('reset');
    $(NEW_CID_INPUT_ID).val(newcid);

});

$(BACK_LINK_ID).click(function () {
    $(CATEGORY_HEADER_ID).show();
    $(PRODUCT_HEADER_ID).hide();
    $(CATEGORY_LIST_CLASS).show();
    $(PRODUCT_LIST_CLASS).remove();
});

$(function () {
    $(NEW_PURCHASE_INPUT_ID).datepicker();
});

$(function () {
    $(NEW_EXPIRY_INPUT_ID).datepicker();
});

// endregion

// region Picture

$(NEW_PRODUCT_IMAGE_SRC_ID).click(function () {
    navigator.camera.getPicture(onProductSuccess, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        saveToPhotoAlbum: false
    });
});
function onProductSuccess(imageData) {
    $(NEW_PRODUCT_IMAGE_SRC_ID).attr('src', imageData);
};


$(NEW_IMAGE_SRC_ID).click(function () {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        saveToPhotoAlbum: false
    });
});
function onSuccess(imageData) {
    $(NEW_IMAGE_SRC_ID).attr('src', imageData);
};

function onFail(message) {
    alert('Picture/Camera failed because: ' + message);
};

// endregion

// region Files

function movePic(file) {
    window.resolveLocalFileSystemURI(file, resolveOnSuccess, resolveOnError);
}

//Callback function when the file system uri has been resolved
function resolveOnSuccess(entry) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
            //The folder is created if doesn't exist
            fileSys.root.getDirectory(LOCAL_IMAGE_FOLDER,
                {create: true, exclusive: false},
                function (directory) {
                    entry.moveTo(directory, gNewImageURL, successMove, resolveOnError);
                },
                resolveOnError);
        },
        resolveOnError);
}

//Callback function when the file has been moved successfully - inserting the complete path
function successMove(entry) {
    // reaload image after save
}

function resolveOnError(error) {
    alert("Fail to move file: " + error.code);
}

// endregion


