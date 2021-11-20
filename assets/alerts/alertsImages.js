import { colors } from '../../style/base';
export const alertsImages = (alert) => {
    switch (alert) {
        case 'water':
            return require('../alerts/water.png');
        case 'bath':
            return require('../alerts/bath.png');
        case 'fertilization':
            return require('../alerts/fertilization.png');
        case 'light':
            return require('../alerts/light.png');
        case 'shower':
            return require('../alerts/shower.png');
        case 'temperature':
            return require('../alerts/temperature.png');
        case 'rotation':
            return require('../alerts/rotation.png');
        case 'compost':
            return require('../alerts/compost.png');
        case 'close':
            return require('../alerts/close.png');
        case 'humidity':
            return require('../alerts/humidity.png');
    }
};

export const alertsImagesDarkColors = (alert) => {
    switch (alert) {
        case 'water':
            return colors.waterDark;
        case 'bath':
            return colors.bathDark;
        case 'fertilization':
            return colors.fertilizationDark;
        case 'light':
            return colors.lightDark;
        case 'shower':
            return colors.showerDark;
        case 'temperature':
            return colors.temperatureDark;
        case 'rotation':
            return colors.rotationDark;
        case 'compost':
            return colors.compostDark;
        case 'humidity':
            return colors.humidityDark;
    }
};

export const alertsImagesLightColors = (alert) => {
    switch (alert) {
        case 'water':
            return colors.waterLight;
        case 'bath':
            return colors.bathLight;
        case 'fertilization':
            return colors.fertilizationLight;
        case 'light':
            return colors.lightLight;
        case 'shower':
            return colors.showerLight;
        case 'temperature':
            return colors.temperatureLight;
        case 'rotation':
            return colors.rotationLight;
        case 'compost':
            return colors.compostLight;
        case 'humidity':
            return colors.humidityLight;
    }
};