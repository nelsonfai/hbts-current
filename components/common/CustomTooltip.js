import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import I18nContext from '../../context/i18nProvider';

export const Z_INDEX = 100;
export const MARGIN = 13;
export const OFFSET_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: Z_INDEX,
  },
  tooltip: {
    position: 'absolute',
    paddingHorizontal: 15,
    overflow: 'hidden',
    width: '100%',
    borderRadius: 16,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    zIndex: Z_INDEX - 1,
  },
  nonInteractionPlaceholder: {
    backgroundColor: 'transparent',
    zIndex: Z_INDEX - 2,
  },
  tooltipText: {
    textAlign: 'center',
  },
  tooltipContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
    position:'relative'
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color:'#9e96de',
    color:'#B0A7F7',

    fontWeight:700
  },
  bottomBar: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
  stepOrder: {
    backgroundColor: '#9e96de',
    backgroundColor:'#B0A7F7',
    padding: 5,
    borderRadius: 50, // Making it a circle by setting borderRadius to half of width/height
    marginBottom: 5,
    textAlign: 'center',
    justifyContent: 'center', // Centering the text vertically
  },
});
// Define your Button component
export const Button = ({ wrapperStyle, style, children, ...rest }) => (
    
  <View style={[styles.button, wrapperStyle]}>
    <Text style={[styles.buttonText, style]} testID={'TourGuideButtonText'}  {...rest}>
      {children}
    </Text>
  </View>
);

// Define your CustomTooltip component
const CustomTooltip = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
  labels,
}) => {
  const { i18n } = useContext(I18nContext); // Accessing labels from context

  return (
    <View
      style={{
        borderRadius: 16,
        paddingTop: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 16,
        width: '80%',
        backgroundColor: '#ffffff',
      }}
    >
      <View style={styles.tooltipContainer}>
        <View style={styles.stepOrder}>
          <Text style={{ textAlign: 'center', color: 'white' }}>{currentStep && currentStep.order}</Text>
        </View>
        <Text testID="stepDescription" style={styles.tooltipText}>
          {currentStep && currentStep.text}
        </Text>
      </View>
      <View style={styles.bottomBar}>
        {!isLastStep ? (
          <TouchableOpacity onPress={handleStop}>
            <Button>{labels?.skip || i18n.t('walkthrough.labels.skip')}</Button>
          </TouchableOpacity>
        ) : null}
        {!isFirstStep ? (
          <TouchableOpacity onPress={handlePrev}>
            <Button>{labels?.previous || i18n.t('walkthrough.labels.previous')}</Button>
          </TouchableOpacity>
        ) : null}
        {!isLastStep ? (
          <TouchableOpacity onPress={handleNext}>
            <Button>{labels?.next || i18n.t('walkthrough.labels.next')}</Button>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStop}>
            <Button>{labels?.finish || i18n.t('walkthrough.labels.finish')}</Button>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


export default CustomTooltip;
