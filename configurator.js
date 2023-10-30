//this function adds items to the table display between the title of the product -
//and the "msrp price container".
function getSelected(clear = false) {
  // variable where will create <table> with content.
  var divList = "";
  // gets <div> where will insert <table>
  var targetDiv = document.getElementById("divList");
  var titleCheckOut = document.getElementById("titleCheckOut");

  //will return if user dont click in any option.
  if (clear) {
    targetDiv.style.display = "none";
    titleCheckOut.style.display = "none";
    return;
  } else {
    targetDiv.style.display = "block";

    if (targetDiv) {
      targetDiv.innerHTML = divList;
    }

    //gets all items selected.
    var items = document.querySelectorAll(".variable-item.image-variable-item");
    //opening tag.
    divList = divList + "<table>";
    items.forEach(function (item) {
      var title = item.getAttribute("title");
      var selected = item.classList.contains("selected");

      if (selected) {
        var closestUL = item.closest("ul[aria-label]");
        if (closestUL) {
          var ariaLabel = closestUL.getAttribute("aria-label");
          divList =
            divList + "<tr> <td> <strong>" + ariaLabel + ":</strong></td> ";
          divList = divList + "<td>" + title.toUpperCase() + "</td></tr>";
        }
      }
    });

    var labels = document.querySelectorAll(".wcpa_image label");
    labels.forEach(function (label) {
      var checked = label.querySelector("input").checked;

      if (checked) {
        var text = label.querySelector(".wcpa_image_label").textContent;

        var title = "Optional";
        divList = divList + "<tr> <td> <strong>" + title + ":</strong></td> ";
        divList = divList + "<td>" + text.toUpperCase() + "</td></tr>";
      }
    });
    //closing tag.
    divList = divList + "</table>";

    //--------------------------------------------------
    if (divList) {
      titleCheckOut.style.display = "block";
    }

    //inserts table create above inside the div.
    if (targetDiv) {
      targetDiv.innerHTML = divList;
    }
  }
}

//setups some styling
jQuery(document).ready(function () {
  getSelected();

  // setting height for legends
  var elements = document.querySelectorAll(
    ".woo-variation-swatches .wvs-style-squared.variable-items-wrapper .variable-item:not(.radio-variable-item)"
  );

  var outlines = document.querySelectorAll(
    "li.variable-item.image-variable-item.selected"
  );

  elements.forEach(function (element) {
    var computedStyles = window.getComputedStyle(element, "::after");
    var legendHeight = computedStyles.getPropertyValue("height");
    legendHeight = parseFloat(legendHeight.replace("px", "")); // Converter a altura para um valor numérico
    element.style.marginBottom = legendHeight + 15 + "px";

    // var bottomValue = -(legendHeight + 15) + 'px';

    // var styleElement = document.createElement('style');
    // styleElement.innerHTML = `
    //     li.variable-item.image-variable-item.selected::before {
    //         bottom: ${bottomValue};
    //     }
    // `;
    // document.head.appendChild(styleElement);
  });
});

// initialize key-value attributes array
var selectedValues = null;
var ulAmount = null;
var makeSureRunOnce = false;
var preservedLabelArray = [];
// this will be used on dumb-proof function
var ulElements = jQuery("ul.variable-items-wrapper");
var vanityColorSku = "";

//1. get the amount of <ul> elements, i.e. the amount of attributes
function getUlAmount() {
  var ulElements = jQuery('ul[data-attribute_name^="attribute_"]');

  return ulElements.length;
}

//2. update attribute label with counter
function setLabelForEachAttribute() {
  //gets div that contains name of product attribute.
  var divElements = jQuery("td.woo-variation-items-wrapper div.titleAttr");

  //iterates over each title found and add text('pick a', etc..)
  divElements.each(function (index) {
    var labelElement = jQuery(this);

    // get the label name
    var labelText = labelElement.text();

    // select one of the phrases randomly
    var phrases = [
      "Pick a",
      "Choose a",
      "Select a",
      "Pick your",
      "Choose your",
      "Select your",
    ];
    var randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    // set new label with counter and random phrase
    var newLabelText = index + 1 + ". " + randomPhrase + " " + labelText;
    labelElement.text(newLabelText);
  });

  //gets labels that contains name of optional add-ons.
  var labelElements = jQuery("label.wcpa_field_label");

  labelElements.each(function (index) {
    var labelElement = jQuery(this);

    // get the label name
    var labelText = labelElement.text();

    // select one of the phrases randomly
    var phrases = ["Pick", "Choose", "Select", "Add"];
    var randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    // set new label with counter and random phrase (and add to the cunter the amount of attributes, which is divEldivElements.length)
    var newLabelText =
      index + divElements.length + 1 + ". " + randomPhrase + " " + labelText;
    labelElement.text(newLabelText);

    // build an array to store the correct optional labels. This is done to fix a bug that duplicates the label when an optional is clicked
    preservedLabelArray[index] = newLabelText;
  });
}

//3. build base URL based on product's SKU
function buildURL() {
  return new Promise(function (resolve, reject) {
    jQuery.ajax({
      url: "/wp-json/nectho/v1/get-product-link",
      method: "POST",
      data: {
        post_id: jQuery("#wc-post-id").text(),
      },
      success: function (response) {
        // Handle the term description here
        var parsedURL = response.replace(/\\\//g, "/");
        resolve(parsedURL);
      },
      error: function (xhr, status, error) {
        // Handle the error here
        // console.log(error);
        var errorMessage = "An error occurred. Please try again later.";

        switch (xhr?.responseJSON?.data?.status) {
          case 400:
            errorMessage = "Internal error. Please, contact us.";
            break;

          case 401:
            errorMessage = "Invalid password. Please try again.";
            break;

          case 404:
            errorMessage =
              "Internal error. Please, try again and if the erorr persists, contact us.";
            break;
        }

        showError(errorMessage);
        reject(error);
      },
    });
  });
}

//4. rearrange features before the see prices button, add title variations in gold
function rearrangeAttributesAndFeatures() {
  // put the features before the see prices button
  var features = document.querySelector("#features");

  if (features) {
    var seePrices = document.querySelector(".single_add_to_cart_button");
    var parent = seePrices.parentNode;

    parent.insertBefore(features, seePrices);
  }

  // title of variations in gold
  jQuery("ul:not(.elementor-icon-list-items)").each(function () {
    // console.log(jQuery(this)[0])

    var ul = jQuery(this)[0];

    var ariaLabel = ul.getAttribute("aria-label");
    var textElement = document.createElement("div");
    textElement.classList.add("titleAttr");
    textElement.textContent = ariaLabel;
    ul.parentNode.insertBefore(textElement, ul);
  });
}

//Aux for step 5. Function to check if a ul has at least one checked li element
function checkUlHasCheckedItem(ulElement) {
  var hasCheckedItem = false;

  // Find the li elements within the current ul element
  var liElements = ulElement.find("li");

  // Check if any li element has aria-checked equal to true
  liElements.each(function () {
    if (jQuery(this).attr("aria-checked") === "true") {
      hasCheckedItem = true;
      return false; // Exit the loop if a checked item is found
    }
  });

  return hasCheckedItem;
}
//5. Adds event listener to click attribute.
function createClickLogicToMakeAtLeastOneAttributeSelected() {
  jQuery("li.image-variable-item").on("click", function () {
    var clickedLi = jQuery(this);

    // Get the parent ul element of the clicked li
    var parentUl = clickedLi.closest("ul.variable-items-wrapper");

    // Iterate through each ul element
    ulElements.each(function () {
      var ulElement = jQuery(this);

      // Ignore the ul element containing the clicked li
      if (ulElement.is(parentUl)) {
        return; // Continue to the next iteration
      }

      // Check if the ul has at least one checked li element
      if (!checkUlHasCheckedItem(ulElement)) {
        // Delay the execution by 50 milliseconds
        setTimeout(function () {
          // Select the first li element inside the ul if it's not already selected
          // console.log('No checked li element in the ul:', ulElement);
          var firstLi = ulElement.find("li:not(.disabled):first");

          // if clickedLi has class selected, means it already was selected, so just unselect it and doesn't propagate the dummy proof click
          //   if (!firstLi.hasClass('selected') && clickedLi.hasClass('selected')) {
          //     firstLi.click();
          //   }
        }, 50);
      }
    });
  });
}

//NOT USED!!-- updates the URL when one of the attributes is selected
function updateURL(index, sku) {
  var attributeValue =
    selectedValues[index][Object.keys(selectedValues[index])[0]];

  console.log("0. " + attributeValue);

  console.log("0.5. " + url);

  if (attributeValue !== null && attributeValue[0] !== null) {
    var urlParams = new URLSearchParams(url);
    console.log("1. " + urlParams);

    var urlSKU = urlParams.get("SKU");
    console.log("2. " + urlSKU);

    var urlParamsArray = urlSKU.split("@");
    console.log("3. " + urlParamsArray);

    var currentIndex = urlParamsArray.length - 1;
    console.log("4. " + currentIndex);

    if (currentIndex > ulAmount && currentIndex < index) {
      urlParamsArray.length = index + 1;
      console.log("5. " + urlParamsArray);
    }

    urlParamsArray[index] = sku;
    console.log(urlParamsArray);

    var updatedURL = url + "@" + urlParamsArray.slice(1).join("@");

    console.log("7. " + updatedURL);

    // url = updatedURL; // Update the global URL variable
  }

  // temporary
  url = url + "~" + sku;
  console.log(url);

  /* ============================= */

  setButtonUrl(url);
}

//receive the final url and set it to the order now button
function setButtonUrl(setUrl) {
  //  when any variation is clicked, build the new URL
  var button = document.querySelector(".single_add_to_cart_button");

  var text = button.textContent;

  var link = document.createElement("a");
  link.textContent = text;

  link.target = "_blank";

  // apply changes to URL here
  // TODO get amount of UL that have key-value not null, build the URL in order
  link.href = setUrl;

  var classes = button.classList;

  for (var i = 0; i < classes.length; i++) {
    link.classList.add(classes[i]);
  }

  button.parentNode.replaceChild(link, button);
}

//STYLING scroll to specified place on page
function scrollToSpecificSection() {
  var section = document.getElementById("main-section");
  window.scrollTo({
    top: section.offsetTop,
    behavior: "smooth",
  });
}

//STYLING build the hover elements for features
function buildHoverForFeatures() {
  var features = document.querySelectorAll(
    ".jet-listing-grid__items > .jet-listing-grid__item"
  );

  features.forEach(function (feature) {
    var tooltip2 = null;

    var titlef = feature.querySelector("h5").innerHTML;
    var imageSrcf = feature.querySelector("img").src;

    feature.addEventListener("mouseenter", function () {
      if (!feature.classList.contains("tooltip-added")) {
        tooltip2 = document.createElement("div");
        tooltip2.classList.add("tooltip");

        var image = document.createElement("img");
        image.src = imageSrcf;
        tooltip2.appendChild(image);

        var text = document.createElement("span");
        text.textContent = titlef;
        tooltip2.appendChild(text);

        feature.appendChild(tooltip2);

        feature.classList.add("tooltip-added");
      }
    });

    feature.addEventListener("mouseleave", function () {
      if (tooltip2) {
        feature.removeChild(tooltip2);
        tooltip2 = null;

        feature.classList.remove("tooltip-added");
      }
    });
  });

  // build tooltip
  var liAttributesElements = document.querySelectorAll(
    ".variable-items-wrapper li"
  );

  liAttributesElements.forEach(function (element) {
    let tooltip = null;

    var title = element.getAttribute("title");

    if (element.classList.contains("image-variable-item")) {
      var imageSrc = element.querySelector("img").src;
    } else {
      imageSrc = "";
    }

    // show tooltip on hover
    element.addEventListener("mouseover", function () {
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");

        var image = document.createElement("img");
        image.src = imageSrc;
        tooltip.appendChild(image);

        var text = document.createElement("span");
        text.textContent = title;
        tooltip.appendChild(text);

        element.appendChild(tooltip);
      }
    });

    element.addEventListener("mouseout", function () {
      if (tooltip) {
        element.removeChild(tooltip);
        tooltip = null;
      }
    });
  });
}

//NOT USED!!-- updates the key-value attributes array with the term's name and SKU
function updateSelectedValues(attributeName, termName) {
  // Find the corresponding key-value pair in selectedValues array and update the value
  for (var i = 0; i < selectedValues.length; i++) {
    var keyValue = selectedValues[i];
    if (keyValue.hasOwnProperty(attributeName)) {
      selectedValues[i][attributeName] = termName;
      return; // Exit the loop once the value is updated
    }
  }

  // If no corresponding key-value pair is found, create a new one and add it to selectedValues array
  // var newKeyValue = {};
  // newKeyValue[attribute] = selectedValue || null;
  // selectedValues.push(newKeyValue);
}

//---------------------------------------------------------------------------------
//NOT USED!! make AJAX request to get the term's description, which is the SKU
function getTermDescription(attributeName, termName) {
  return new Promise(function (resolve, reject) {
    jQuery.ajax({
      url: "/wp-json/nectho/v1/get-sku-desc",
      method: "POST",
      data: {
        attribute: attributeName,
        term: termName,
      },
      success: function (response) {
        // Handle the term description here
        resolve(response);
      },
      error: function (xhr, status, error) {
        // Handle the error here
        // console.log(error);
        reject(error);
      },
    });
  });
}

//NOT USED!! build a key-value array with the attributes
function buildKeyValueAttributesArray() {
  var ulElements = jQuery('ul[data-attribute_name^="attribute_"]');

  selectedValues = []; // Array to store the selected attribute values

  ulElements.each(function () {
    var attributeName = jQuery(this)
      .data("attribute_name")
      .replace(/^attribute_/, "");
    var termName = jQuery(this).find('li[aria-checked="true"]').data("value");

    // Build the key-value object and add it to the selectedValues array
    var keyValue = {};

    if (!termName) {
      keyValue[attributeName] = [null, null];
    } else {
      getTermDescription(attributeName, termName)
        .then(function (response) {
          // check if term has a specific SKU
          if (response != "") {
            var termSKU = response;

            // update array containing every UL and term name + term SKU
            keyValue[attributeName] = [termName, termSKU];
          }
        })
        .catch(function (error) {
          // Handle the error here
          console.error(error);
        })
        .finally(() => {
          // console.log(JSON.stringify(selectedValues))
        });
    }

    selectedValues.push(keyValue);
  });
}
//---------------------------------------------------------------------------------

//NOT USED!!
function getClickedUlIndex(ulElement) {
  var ulElements = Array.from(
    document.querySelectorAll('ul[data-attribute_name^="attribute_"]')
  );
  var ulIndex = ulElements.indexOf(ulElement);

  return ulIndex;
}

//----------------------------------------------FUNCTIONS THAT FETCH DATA FROM WP-----------------------
// Function to fetch and display the term description
function fetchTermDescription(attributeName, selectedTerm, callback) {
  jQuery.ajax({
    url: "/wp-json/nectho/v1/get-sku-desc",
    method: "POST",
    data: {
      attribute: attributeName,
      term: selectedTerm,
    },
    success: function (response) {
      // Call the callback function with the response data
      if (typeof callback === "function") {
        callback(response);
      }
      // console.log('Term Description: ', response);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error:", errorThrown);
    },
  });
}

function checkAndSetVanityFinish(attributeName, selectedTerm) {
  if (attributeName && attributeName.includes("finish")) {
    fetchTermDescription(attributeName, selectedTerm, function (response) {
      vanityColorSku = response;
      // console.log("Global Vanity color was set to " + vanityColorSku + " (" + selectedTerm + ")");
    });

    return true;
  }

  return false;
}
//------------------------------------------------

// get every <li> attribute option and set click function
function createAttributeClickLogic() {
  var liAttributesElements = document.querySelectorAll(
    ".variable-items-wrapper li"
  );

  liAttributesElements.forEach(function (element) {
    // add below's functions to a click on any of the <li> options
    element.addEventListener("click", function () {
      console.log(jQuery(this));

      // hide the order now button
      setButton(false);

      // gets the closes attribute element (i.e., the one that was clicked)
      var attributeUlElement = this.closest("ul");
      // get the name of the clicked attribute
      var clickedAttributeName = attributeUlElement
        .getAttribute("data-attribute_name")
        .replace(/^attribute_/, "");
      // get which term was clicked for this attribute
      var clickedTermName = this.getAttribute("data-value");

      // Array to store the selected attribute values
      selectedValues = [];

      setTimeout(function () {
        // get every Attribute element
        var ulElements = jQuery('ul[data-attribute_name^="attribute_"]');

        var foundFinish = checkAndSetVanityFinish(
          clickedAttributeName,
          clickedTermName
        );

        // iterate through each attribute to build the selected values array
        ulElements.each(function () {
          var attributeName = jQuery(this)
            .data("attribute_name")
            .replace(/^attribute_/, "");
          var termName = jQuery(this)
            .find('li[aria-checked="true"]')
            .data("value");

          if (!foundFinish) {
            foundFinish = checkAndSetVanityFinish(attributeName, termName);
          }

          // this is done just to fix a build where the selected attribute was detecting the prior clicked attribute term instead of the current clicked (as if it the detection was being "delayed")
          if (clickedAttributeName == attributeName) {
            termName = clickedTermName;
          }

          // Build the key-value object and add it to the selectedValues array
          var keyValue = {};

          // the key is the attribute name and the value is the selected term (if there's one)
          keyValue[attributeName] = termName ? termName : null;

          selectedValues.push(keyValue);
        });

        fetchSkusAjax(selectedValues);
      }, 100);
    });
  });
}

function createOptionalAttributeClickLogic() {
  jQuery('.wcpa_image input[type="checkbox"]').on("change", function () {
    // hide the order now button
    setButton(false);

    /* set the label to prevent a bug that is duplicating the optional attribute label */
    var clickedInput = jQuery(this);
    var closestLabel = clickedInput
      .closest(".wcpa_row")
      .find(".wcpa_field_label");
    jQuery("label.wcpa_field_label").each(function (index, label) {
      if (label === closestLabel[0]) {
        // If it matches, change the text
        jQuery(label).text(preservedLabelArray[index]);
        return false; // Exit the loop since we found the closest label
      }
    });
    /* end */

    // get every Attribute element
    var ulElements = jQuery('ul[data-attribute_name^="attribute_"]');

    // Array to store the selected attribute values
    selectedValues = [];

    // update global finish
    var foundFinish = false;

    // iterate through each attribute to build the selected values array
    ulElements.each(function () {
      var attributeName = jQuery(this)
        .data("attribute_name")
        .replace(/^attribute_/, "");
      var termName = jQuery(this).find('li[aria-checked="true"]').data("value");

      if (!foundFinish) {
        foundFinish = checkAndSetVanityFinish(attributeName, termName);
      }

      // Build the key-value object and add it to the selectedValues array
      var keyValue = {};

      // the key is the attribute name and the value is the selected term (if there's one)
      keyValue[attributeName] = termName ? termName : null;

      selectedValues.push(keyValue);
    });

    fetchSkusAjax(selectedValues);
  });
}

function fetchSkusAjax(selected_values = null) {
  if (!selected_values) {
    return false;
  }

  new Promise(function (resolve, reject) {
    jQuery.ajax({
      url: "/wp-json/nectho/v1/get-product-link",
      method: "POST",
      data: {
        post_id: jQuery("#wc-post-id").text(),
        selected_values: selectedValues,
      },
      success: function (response) {
        // Handle the term description here
        var parsedURL = response.replace(/\\\//g, "/");

        // get every SKU from selected optional attributes
        setTimeout(function () {
          var selectedOptionalAttributes = getSelectedCheckboxes();
          // add then to the URL
          parsedURL = parsedURL + selectedOptionalAttributes;

          setButtonUrl(parsedURL);
          setButton(true);
          resolve(parsedURL);
        }, 1000);
      },
      error: function (xhr, status, error) {
        // Handle the error here
        // console.log(error);
        var errorMessage = "An error occurred. Please try again later.";

        switch (xhr?.responseJSON?.data?.status) {
          case 400:
            errorMessage = "Internal error. Please, contact us.";
            break;

          case 404:
            errorMessage =
              "Internal error. Please, try again and if the erorr persists, contact us.";
            break;
        }

        showError(errorMessage);
        reject(error);
      },
    });
  });
}

// this will build the code of every selected value (SKU)
function getSelectedCheckboxes() {
  var selectedValues = [];

  jQuery('.wcpa_image input[type="checkbox"]:checked').each(function () {
    sku = jQuery(this).val();

    // substitute &color with the color selected for the vanity
    if (sku.includes("&color") && vanityColorSku) {
      sku = sku.replace("&color", "-" + vanityColorSku);

      // ELORA quickfix
      if (
        sku.endsWith("M15-V03") ||
        sku.endsWith("M60-V15") ||
        sku.endsWith("M32-V32") ||
        sku.endsWith("M23-V23")
      ) {
        // remove "-Vxx"
        sku = sku.slice(0, -4);
      }

      // LOTO quickfix
      /* disable because Loto is soon to be deprecated
            if ((vanityColorSku == "GRVT") || (vanityColorSku == "RRVT")) {
                // remove "VT"
                sku = sku.slice(0, -2);
            }
            */

      // check 32" to see if has old or new code
      /* disabled because we don't use old codes anymore
            if (sku.startsWith("29380")) {
                if (sku.endsWith("BF") || sku.endsWith("BI") || sku.endsWith("CP") || sku.endsWith("GR") || sku.endsWith("OR")) {
                    // if mirror is 32" and finish is ash wood white, glossy white, cement, glossy gray or elm rousseau, we use old codes
                    sku = sku.replace("29380", "28281");
                }
            }
            */

      // for mirror cabinet 22"
      /* disabled because these 29255 codes are deprecated
            if (sku.startsWith("29255")) {
                sku = sku + "NX";
            }
            */
    }

    selectedValues.push("~" + sku);
  });

  return selectedValues.join("");
}

function setButton(enable) {
  setTimeout(getSelected(), 100);

  var button = jQuery(".single_add_to_cart_button");

  if (!enable) {
    // Add the "disabled" class and update the text
    button.text("LOADING...");
    button.css("opacity", 0.5);
    button.css("pointer-events", "none");
  } else {
    button.text("ORDER NOW"); // .removeClass('disabled')
  }
}

function selectRequiredAttributes() {
  // Select the attribute dropdowns
  var attributeDropdowns = jQuery(".variations select");

  // Listen for attribute selection changes
  attributeDropdowns.on("change", function () {
    // Get the selected attribute dropdown
    var selectedDropdown = jQuery(this);

    // Get the selected option value
    var selectedOptionValue = selectedDropdown.val();

    // Iterate through the other attribute dropdowns
    attributeDropdowns.not(selectedDropdown).each(function () {
      // Get the current attribute dropdown
      var dropdown = jQuery(this);

      // Get the first option of the dropdown
      var firstOption = dropdown.find("option:first");

      // Check if the dropdown is still unselected
      if (!dropdown.val()) {
        // Select the first option of the dropdown
        firstOption.prop("selected", true);
      }
    });
  });
}

/* ========================================= */
/* PASSWORD PROTECTION BUTTON IMPLEMENTATION */

// Function to handle the button click event
function handleButtonClick() {
  var inputPassword = prompt("Please enter the download password:");

  if (inputPassword) {
    tryPassword(inputPassword)
      .then(function (response) {
        if (response) {
          var url = response;
          var parsedURL = response.replace(/\\\//g, "/");

          // var url = jQuery('#3d-download-button').attr('href');
          window.open(parsedURL);
        } else {
          // showError('Invalid password. Please try again.');
          // return;
        }
      })
      .catch(function (error) {
        // showError('An error occurred. Please try again later.');
        // console.error(error);
      });
  }
}

// make AJAX request to get the post ID and download password
function tryPassword(inputPassword) {
  return new Promise(function (resolve, reject) {
    jQuery.ajax({
      url: "/wp-json/nectho/v1/download-3d",
      method: "POST",
      data: {
        password: inputPassword,
        post_id: jQuery("#wc-post-id").text(),
      },
      success: function (response) {
        // Handle the term description here
        resolve(response);
      },
      error: function (xhr, status, error) {
        // Handle the error here
        // console.log(error);
        var errorMessage = "An error occurred. Please try again later.";

        switch (xhr?.responseJSON?.data?.status) {
          case 400:
            errorMessage = "Internal error. Please, contact us.";
            break;

          case 401:
            errorMessage = "Invalid password. Please try again.";
            break;

          case 404:
            errorMessage =
              "Internal error. Please, try again and if the erorr persists, contact us.";
            break;
        }

        showError(errorMessage);
        reject(error);
      },
    });
  });
}

// show error message
function showError(message) {
  // jQuery('#error_message_div').text(message);
  alert(message);
}

function set3dButtonClick() {
  jQuery("#3d-download-button").on("click", function (event) {
    event.preventDefault();
    handleButtonClick();
  });
}

/* END PASSWORD PROTECTION BUTTON IMPLEMENTATION */
/* ========================================= */

function logicOnClearClick() {
  jQuery(".reset_variations").on("click", function () {
    // Uncheck selected optionals
    jQuery(".wcpa_image label").each(function () {
      if (jQuery(this).find("input").prop("checked")) {
        jQuery(this).click();
      }
    });

    // reset selected variations
    getSelected(true);
  });
}

jQuery(document).ready(function () {
  if (!makeSureRunOnce) {
    // get the amount of UL which means the amount of attributes
    ulAmount = getUlAmount();

    // set count on labels of the attributes
    setTimeout(() => {
      setLabelForEachAttribute();
    }, "1000");

    // call AJAX to build the URL from backend
    buildURL()
      .then(function (response) {
        // Handle the response here
        // check if term has a specific SKU
        if (response != "") {
          url = response;
        }
      })
      .catch(function (error) {
        // Handle the error here
        console.error(error);
      });

    setTimeout(() => {
      jQuery(".single_add_to_cart_button").show();
    }, "2000");

    // rearrange attributes and move features below
    rearrangeAttributesAndFeatures();

    // Dumb proof attribute selection logic
    createClickLogicToMakeAtLeastOneAttributeSelected();

    /* === ORDER NOW BUTTON LOGIC === */
    // initialize key-value attributes array
    // buildKeyValueAttributesArray();

    // initialize function that set what happens when one of the attributes is clicked
    createAttributeClickLogic();
    createOptionalAttributeClickLogic();
    /* === END ORDER NOW BUTTON LOGIC === */

    // initialize features hovers
    buildHoverForFeatures();

    // scroll to specific section of the page (below the Intro banner)
    // scrollToSpecificSection();

    // Log the selected attribute values
    // setTimeout(() => console.log(JSON.stringify(selectedValues)), 3000);

    // Add click event listener to the 3d button
    set3dButtonClick();

    // Logic to clear everything when clear button is clicked
    logicOnClearClick();
  }
  makeSureRunOnce = true;
});
