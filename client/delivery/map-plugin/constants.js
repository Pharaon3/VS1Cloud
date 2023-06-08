export const constColors = [
    "rgba(88,86,214,0.7)",
    "rgba(255,45,85,0.7)",
    "rgba(0,122,255,0.7)",
    "rgba(255,149,0,0.7)",
    "rgba(170,215,35,0.9)",
    "rgba(76,217,100,0.7)",
    "rgba(239,66,148,0.7)",
    "rgba(255,204,0,0.7)",
    "rgba(52,170,220,0.7)",
    "rgba(255,59,48,0.7)",
    "rgba(90,200,250,0.7)",
    "rgba(142,142,147,0.7)",
];

export const constColorClasses = [
    "colorDriverViolet",
    "colorDriverPink",
    "colorDriverBlue",
    "colorDriverOrange",
    "colorDriverLimeGreen",
    "colorDriverGreen",
    "colorDriverFushcia",
    "colorDriverYellow",
    "colorDriverLightBlue",
    "colorDriverBloodOrange",
    "colorDriverBlueGreen",
    "colorDriverGrey",
];

export const svgPinDriver = `<svg viewBox="0 0 51 67" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
<defs>
  <filter x="-25.5" y="-33.5" width="100" height="100" filterUnits="objectBoundingBox" id="marker-driver-shadow">
    <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
    <feGaussianBlur stdDeviation="1.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
    <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
    <feMerge>
      <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  </filter>
</defs>
<g class="marker-shape driver-shape" fill="none" fill-rule="evenodd" transform="translate(2)">
  <path class="pin-bone-driver" d="m30.809 44.573c8.975-3.01 15.433-11.416 15.433-21.313 0-12.426-10.182-22.5-22.742-22.5-12.56 0-22.742 10.07-22.742 22.5 0 9.897 6.459 18.301 15.433 21.313 2.683 9.645 5.428 17.416 7.309 17.416 1.881 0 4.626-7.771 7.309-17.416"></path>
  <path class="pin-driver" d="m29.75 31.901c.521 0 .971-.186 1.352-.557.381-.37.571-.809.571-1.317 0-.507-.19-.946-.571-1.317-.381-.371-.831-.557-1.352-.557-.521 0-.971.186-1.352.557-.38.371-.571.81-.571 1.317 0 .507.191.946.571 1.317.381.371.832.557 1.352.557m3.846-9.806c0-.127-.045-.234-.135-.322l-2.93-2.854c-.09-.088-.2-.132-.331-.132h-2.374v3.747h5.77v-.439m-17.309 9.806c.521 0 .972-.186 1.352-.557.381-.37.571-.809.571-1.317 0-.507-.19-.946-.571-1.317-.38-.371-.831-.557-1.352-.557-.521 0-.971.186-1.352.557-.38.371-.571.81-.571 1.317 0 .507.191.946.571 1.317.381.371.832.557 1.352.557m-5.484-18.456c.19-.185.415-.278.676-.278h15.386c.261 0 .486.093.676.278.19.186.285.405.285.659v2.811h2.404c.271 0 .564.063.88.19.315.127.569.283.759.468l2.975 2.898c.13.127.243.273.338.439.096.166.166.315.21.447.046.132.078.312.098.541.02.229.032.398.038.506.005.107.005.292 0 .556-.005.263-.008.434-.008.512v4.683c.261 0 .486.093.676.278.19.185.286.405.286.659 0 .146-.02.275-.06.388-.04.112-.108.203-.203.271-.095.069-.178.125-.248.168-.07.044-.188.073-.353.088-.165.015-.278.024-.338.029-.06.005-.188.005-.383 0-.196-.005-.308-.007-.338-.007h-.962c0 1.034-.375 1.917-1.127 2.649-.751.731-1.658 1.098-2.72 1.098-1.062 0-1.968-.366-2.72-1.098-.751-.732-1.127-1.615-1.127-2.649h-5.77c0 1.034-.375 1.917-1.127 2.649-.751.731-1.657 1.098-2.72 1.098-1.062 0-1.968-.366-2.72-1.098-.751-.732-1.126-1.615-1.126-2.649-.031 0-.143.002-.338.007-.196.005-.323.005-.383 0-.06-.005-.173-.015-.338-.029-.166-.015-.283-.044-.353-.088-.07-.044-.153-.099-.248-.168-.095-.068-.163-.158-.203-.271-.04-.112-.06-.242-.06-.388v-14.987c0-.253.096-.473.286-.659"></path>
</g>
</svg>`,
    svgStop = `<svg viewBox="0 0 45 68" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
<defs>
  <filter x="-22.5" y="-34" width="90" height="136" filterUnits="objectBoundingBox" id="marker-visit-shadow">
    <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
    <feGaussianBlur stdDeviation="1.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
    <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
    <feMerge>
      <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  </filter>
</defs>
<g class="marker-shape visit-shape" fill="none" fill-rule="evenodd" transform="translate(3 .5)">
  <path class="pin-bone" d="M28.545,35.9 C34.615,32.749 38.748,26.454 38.748,19.204 C38.748,8.797 30.224,0.36 19.708,0.36 C9.193,0.36 0.668,8.797 0.668,19.204 C0.668,26.455 4.805,32.749 10.871,35.9 C13.848,48.462 17.636,62.487 19.707,62.487 C21.779,62.487 25.566,48.467 28.543,35.9"></path>
  <path class="pin-visit" d="M15.2251956,32.1522809 C16.4528978,40.1634055 18.6389732,53.371 19.708,53.371 C20.7770846,53.371 22.9633386,40.1649748 24.1910035,32.1509852 C29.581516,30.2915765 33.458,25.1729946 33.458,19.149 C33.458,11.5544693 27.3058441,5.399 19.708,5.399 C12.1192769,5.399 5.958,11.5544693 5.958,19.149 C5.958,25.1743943 9.8305443,30.2939551 15.2251956,32.1522809 L15.2251956,32.1522809 Z M19.708,27.649 C24.3992106,27.649 28.208,23.8438008 28.208,19.149 C28.208,14.4541992 24.4048491,10.649 19.708,10.649 C15.0167894,10.649 11.208,14.4541992 11.208,19.149 C11.208,23.8438008 15.0111509,27.649 19.708,27.649"></path>
</g>
</svg>`,
    svgCar = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1186 1024">
    <path d="M1038.38 684.912h-890.772c-20.846 0-37.747-16.901-37.747-37.747v-129.932c0-58.805 47.671-106.475 106.475-106.475h753.312c58.808 0 106.479 47.67 106.479 106.475v129.932c0 20.846-16.901 37.747-37.747 37.747v0zM1038.38 792.701c80.377 0 145.537-65.16 145.537-145.537v-129.932c0-118.336-95.931-214.265-214.269-214.265h-753.312c-118.335 0-214.265 95.93-214.265 214.265v129.932c0 80.377 65.16 145.537 145.537 145.537h890.772z"></path>
    <path d="M961.711 302.967h-737.433l53.281 62.008 31.002-203.589c4.513-29.631 29.992-51.524 59.965-51.524h448.939c29.973 0 55.451 21.892 59.965 51.526l31.002 203.587 53.281-62.008zM961.711 410.757c32.998 0 58.248-29.386 53.281-62.008l-31.002-203.589c-12.534-82.29-83.289-143.086-166.526-143.086h-448.939c-83.237 0-153.992 60.796-166.525 143.084l-31.002 203.592c-4.968 32.622 20.283 62.008 53.281 62.008h737.433z"></path>
    <path d="M477.504 592.842h230.98c29.765 0 53.895-24.129 53.895-53.895s-24.129-53.895-53.895-53.895h-230.98c-29.765 0-53.895 24.129-53.895 53.895s24.129 53.895 53.895 53.895v0z"></path>
    <path d="M270.098 896.779c-28.74 0-52.037-23.298-52.037-52.037 0-28.743 23.298-52.042 52.037-52.042s52.037 23.298 52.037 52.042c0 28.74-23.298 52.037-52.037 52.037v0zM270.098 1004.569c88.27 0 159.827-71.557 159.827-159.827 0-88.273-71.556-159.831-159.827-159.831s-159.827 71.558-159.827 159.831c0 88.27 71.557 159.827 159.827 159.827v0z"></path>
    <path d="M916.768 896.779c-28.74 0-52.037-23.298-52.037-52.037 0-28.743 23.298-52.042 52.037-52.042s52.037 23.298 52.037 52.042c0 28.74-23.298 52.037-52.037 52.037v0zM916.768 1004.569c88.27 0 159.827-71.557 159.827-159.827 0-88.273-71.556-159.831-159.827-159.831s-159.827 71.558-159.827 159.831c0 88.27 71.557 159.827 159.827 159.827v0z"></path>
</svg>
`;

export const svgRunningCar = `
<svg viewBox="0 0 51 67" xmlns="http://www.w3.org/2000/svg" class="running-car">
  <path class="pin-driver" d="m29.75 31.901c.521 0 .971-.186 1.352-.557.381-.37.571-.809.571-1.317 0-.507-.19-.946-.571-1.317-.381-.371-.831-.557-1.352-.557-.521 0-.971.186-1.352.557-.38.371-.571.81-.571 1.317 0 .507.191.946.571 1.317.381.371.832.557 1.352.557m3.846-9.806c0-.127-.045-.234-.135-.322l-2.93-2.854c-.09-.088-.2-.132-.331-.132h-2.374v3.747h5.77v-.439m-17.309 9.806c.521 0 .972-.186 1.352-.557.381-.37.571-.809.571-1.317 0-.507-.19-.946-.571-1.317-.38-.371-.831-.557-1.352-.557-.521 0-.971.186-1.352.557-.38.371-.571.81-.571 1.317 0 .507.191.946.571 1.317.381.371.832.557 1.352.557m-5.484-18.456c.19-.185.415-.278.676-.278h15.386c.261 0 .486.093.676.278.19.186.285.405.285.659v2.811h2.404c.271 0 .564.063.88.19.315.127.569.283.759.468l2.975 2.898c.13.127.243.273.338.439.096.166.166.315.21.447.046.132.078.312.098.541.02.229.032.398.038.506.005.107.005.292 0 .556-.005.263-.008.434-.008.512v4.683c.261 0 .486.093.676.278.19.185.286.405.286.659 0 .146-.02.275-.06.388-.04.112-.108.203-.203.271-.095.069-.178.125-.248.168-.07.044-.188.073-.353.088-.165.015-.278.024-.338.029-.06.005-.188.005-.383 0-.196-.005-.308-.007-.338-.007h-.962c0 1.034-.375 1.917-1.127 2.649-.751.731-1.658 1.098-2.72 1.098-1.062 0-1.968-.366-2.72-1.098-.751-.732-1.127-1.615-1.127-2.649h-5.77c0 1.034-.375 1.917-1.127 2.649-.751.731-1.657 1.098-2.72 1.098-1.062 0-1.968-.366-2.72-1.098-.751-.732-1.126-1.615-1.126-2.649-.031 0-.143.002-.338.007-.196.005-.323.005-.383 0-.06-.005-.173-.015-.338-.029-.166-.015-.283-.044-.353-.088-.07-.044-.153-.099-.248-.168-.095-.068-.163-.158-.203-.271-.04-.112-.06-.242-.06-.388v-14.987c0-.253.096-.473.286-.659"></path>
</svg>`;

MapStyleC = [
    {
        featureType: "administrative",
        elementType: "labels",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "administrative.country",
        elementType: "all",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },
    {
        featureType: "administrative.province",
        elementType: "all",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },
    {
        featureType: "administrative.locality",
        elementType: "all",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },
    {
        featureType: "administrative.neighborhood",
        elementType: "all",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "administrative.land_parcel",
        elementType: "all",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "landscape.natural",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#c4eeb5",
            },
        ],
    },
    {
        featureType: "landscape.natural.terrain",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#bde6af",
            },
        ],
    },
    {
        featureType: "poi",
        elementType: "all",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.attraction",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.business",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.government",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.medical",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.park",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.place_of_worship",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.school",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi.sports_complex",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "transit",
        elementType: "all",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "transit.station",
        elementType: "all",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
];

export const nextPermutation = (arr, n) => {
    let perAch = false;
    let firstPivotPos;
    let secondPivotPos;
    for (let i = 0; i < arr.length; i++) {
        if (secondPivotPos) {
            if (arr[i] < arr[secondPivotPos] && arr[i] > arr[firstPivotPos]) {
                secondPivotPos = i;
            }
        } else if (
            i < arr.length &&
            arr[i] < arr[i + 1] &&
            arr[i] + 1 != arr[i + 1]
        ) {
            firstPivotPos = i;
            secondPivotPos = i + 1;
        } else if (
            i < arr.length &&
            arr[i] < arr[i + 1] &&
            arr[i] + 1 == arr[i + 1]
        ) {
            firstPivotPos = i + 1;
        }
    }
    let largestElem = arr[secondPivotPos];
    for (i = secondPivotPos; i < arr.length; i++) {
        if (largestElem < arr[i]) {
            let swap = arr[i];
            arr[i] = arr[secondPivotPos];
            arr[secondPivotPos] = swap;
            return arr;
        }
    }
    let swap = arr[secondPivotPos];
    arr[secondPivotPos] = arr[firstPivotPos];
    arr[firstPivotPos] = swap;
    let arr2 = arr.slice(firstPivotPos + 1);
    let arr1 = arr.slice(0, firstPivotPos + 1);
    arr2.sort(function (a, b) {
        return a - b;
    });
    return [...arr1, ...arr2];
};
