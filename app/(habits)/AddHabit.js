import React, { useState,useEffect,useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Platform, SafeAreaView, ScrollView, Alert } from 'react-native';
import DatePickerModal from '../../components/Habits/HabitsDatePickerModal';
import { COLORS } from '../../constants';
import { useUser } from '../../context/userContext';
import { useRouter,useLocalSearchParams,Stack, } from 'expo-router';
import AsyncStorageService from '../../services/asyncStorage';
import { useRefresh } from '../../context/refreshContext';
import HabitIconModal from '../../components/Habits/HabitIcons';
import MyHabitIcon from '../../components/Habits/habitIcon';
import I18nContext from '../../context/i18nProvider';
import { API_BASE_URL,colorOptions } from '../../appConstants';
import {schedulePushNotification,cancelAllHabitNotifications} from '../../services/notificationServices'
//import { err } from 'react-native-svg/lib/typescript/xml';

const HabitModal = () => {
  const initialState = {
    habitName: '',
    description: '',
    startDate: new Date(),
    endDate: null,
    setReminder: false,
    reminderTime: new Date(),
    isStartDatePickerVisible: false,
    isEndDatePickerVisible: false,
    isReminderTimePickerVisible: false,
    selectedColor: null,
    isshared:true,
    selectedDays: [],
    frequency: 'daily',
    habitIcon:'hourglass',
    selectedDaysOfMonth:[],
    specific_day_of_month:[]
  };
  const router = useRouter();
  const {refresh,setRefresh} = useRefresh();
  const params = useLocalSearchParams();
  const [iconModalShow, setIconModalShow] = useState(false)

  
  const [habitName, setHabitName] = useState(initialState.habitName);
  const [description, setDescription] = useState(initialState.description);
  const [startDate, setStartDate] = useState(initialState.startDate);
  const [endDate, setEndDate] = useState(initialState.endDate);
  const [setReminder, setSetReminder] = useState(initialState.setReminder);
  const [reminderTime, setReminderTime] = useState(initialState.reminderTime);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(initialState.isStartDatePickerVisible);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(initialState.isEndDatePickerVisible);
  const [isReminderTimePickerVisible, setReminderTimePickerVisible] = useState(initialState.isReminderTimePickerVisible);
  const [selectedColor, setSelectedColor] = useState(initialState.selectedColor);
  const [selectedDays, setSelectedDays] = useState(initialState.selectedDays);
  const [frequency, setFrequency] = useState(initialState.frequency);
  const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState(initialState.selectedDaysOfMonth);


  const [isshared , setIsShared] = useState(initialState.isshared)
  const [habitIcon,setHabitIcon] = useState(initialState.habitIcon)
  const [habits, setHabits] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const { user } = useUser();
  const [habitNameError, setHabitNameError] = useState('');
  const [selectedColorError, setSelectedColorError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const {i18n} = useContext(I18nContext)

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly'];


  useEffect(() => {
    if (!params) return;
    if (params.mood == 'update') {
      setHabitStateFromParams(params);
    }
    else if (params.mood === 'create') {
      resetModalState()
    }
  }, [params.mood]);

  const setHabitStateFromParams = (params) => {
    setHabitName(params.name || initialState.habitName);
    setDescription(params.description || initialState.description);
    setStartDate(params.start_date ? new Date(params.start_date) : initialState.startDate);
    setEndDate(params.end_date ? new Date(params.end_date) : initialState.endDate);
    
    setSetReminder(params.hasReminder ==='true'? true : false);
    setReminderTime(
      params.reminder_time ? new Date(`${params.reminder_time}`) : initialState.reminderTime
    );
    setStartDatePickerVisible(false);
    setEndDatePickerVisible(false);
    setReminderTimePickerVisible(false);
    setSelectedColor(params.color || initialState.selectedColor);
    setSelectedDays(params.specific_days_of_week.split(',')|| initialState.selectedDays);
    setFrequency(params.frequency || initialState.frequency);
    setIsShared(params.isshared ==='true'? true : false);
    setHabitIcon(params.habitIcon||initialState.habitIcon)
    setSelectedDaysOfMonth(
      params.specific_day_of_month ? params.specific_day_of_month.split(',').map(Number) : initialState.selectedDaysOfMonth
    );

  };

    const handleSwitchChange = (value) => {
        setIsShared(value);
      };
    
  const handleFrequencyPress = (selectedFrequency) => {
    setFrequency(selectedFrequency);
  };

  const handleDayOfMonthSelect = (day) => {
    if (selectedDaysOfMonth.includes(day)) {
      setSelectedDaysOfMonth(selectedDaysOfMonth.filter((selectedDay) => selectedDay !== day));
    } else {
      setSelectedDaysOfMonth([...selectedDaysOfMonth, day]);
    }
  };

const renderDayOfMonthPicker = () => {
  if (frequency === 'monthly') {
    return (
      <View>
        <Text style={styles.label}>{i18n.t('editHabit.selectDayOfMonth')}</Text>
        {/* Render checkboxes for each day of the month */}
        <View style={styles.daysOfMonthContainer}>
          {[...Array(31).keys()].map((day) => (
            <TouchableOpacity
              key={day + 1}
              style={[styles.dayOfMonthCheckbox, { backgroundColor: selectedDaysOfMonth.includes(day + 1) ? 'black' : 'gray' }]}
              onPress={() => handleDayOfMonthSelect(day + 1)}
            >
              <Text style={styles.dayOfMonthText}>{day + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
  return null;
};

  const resetModalState = () => {
    setHabitName(initialState.habitName);
    setDescription(initialState.description);
    setStartDate(initialState.startDate);
    setEndDate(initialState.endDate);
    setSetReminder(initialState.setReminder);
    setReminderTime(initialState.reminderTime);
    setStartDatePickerVisible(initialState.isStartDatePickerVisible);
    setEndDatePickerVisible(initialState.isEndDatePickerVisible);
    setReminderTimePickerVisible(initialState.isReminderTimePickerVisible);
    setSelectedColor(initialState.selectedColor);
    setSelectedDays(initialState.selectedDays);
    setFrequency(initialState.frequency);
    setIsShared(initialState.isshared)
    setHabitIcon(initialState.habitIcon)
  };

  const handleCreateHabit = async () => {
    try {
      // Validate habit name and color
      if (!habitName) {
        setHabitNameError(i18n.t('editHabit.selectName.errorNone'));
        return;
      } else {
        setHabitNameError('');
      }
  
      if (!selectedColor) {
        setSelectedColorError(i18n.t('editHabit.selectColor.error'));
        return;
      } else {
        setSelectedColorError('');
      }
  
      // Get user token
      const token = await AsyncStorageService.getItem('token');
  
      // Construct habit creation request body
      const specificDaysString = frequency === 'weekly' ? selectedDays.join(',') : null;
      const specificMonthDayString = frequency === 'monthly' ? selectedDaysOfMonth.join(',') : null;
      const teamValue = isshared && user.team_id ? user.team_id : null;
      const requestBody = {
        user: user.id,
        team: teamValue,
        color: selectedColor,
        name: habitName,
        icon: habitIcon,
        frequency: frequency,
        description: description,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        reminder_time: setReminder ? reminderTime : null,
        specific_days_of_week: specificDaysString,
        specific_day_of_month: specificMonthDayString,
      };
  
      // Send habit creation request to the server
      const response = await fetch(`${API_BASE_URL}/habits/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
        // Parse response data
        const responseData = await response.json();
      // Check if the request was successful
      if (!response.ok) {
      
        const errorMessage = responseData.error;

        // Check if the error message contains "habit limit"
        if (errorMessage.includes('habit limit')) {
          Alert.alert(
            'Habit Limit Reached',
            'You have reached your maximum habit limit of 3.\nSubscribe to premium plan to create more',
            [
                {
                    text: 'Subscribe',
                    onPress: () => handleSubscription(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: false }
        );
        
    }}
  

  
      // Check if the habit creation was successful
      if (responseData) {
        // Habit created successfully, handle any additional actions
        const daysString = responseData.specific_days_of_week;
        if (setReminder && responseData) {
          const notificationId = await schedulePushNotification(
            habitName,
            description,
            reminderTime,
            daysString ? daysString.split(',') : [],
            responseData.habitidentifier
          );
        }
        setRefresh({ refreshHabits: true, refreshList: false, refreshSummary: true, refreshNotes: false });
        resetModalState();
        router.push('/habits');
      } 
    } catch (error) {
    } finally {
      // Update loading state
      setLoading(false);
    }
  };
  

  const handleUpdateHabit = async () => {
    if (!habitName) {
      setHabitNameError(i18n.t('editHabit.selectName.error'));
      return;}
      else if(habitName.length > 60){
        setHabitNameError(i18n.t('editHabit.selectName.errorList'));
        return;
      }
     else {
      setHabitNameError('');
    }
    if(description.length > 100){
      setDescriptionError(i18n.t('editHabit.description.error'))
      return;
    }
    if (!selectedColor) {
      setSelectedColorError(i18n.t('editHabit.selectColor.error'));
      return;
    } else {
      setSelectedColorError('');
    }

    const token =  await AsyncStorageService.getItem('token'); 
    const specificDaysString = frequency === 'weekly' ? selectedDays.join(',') : null;
    const teamValue = isshared && user.team_id ? user.team_id : null;
    const specificMonthDayString = frequency === 'monthly' ? selectedDaysOfMonth.join(',') : null;

    try {
      const response = await fetch(`${API_BASE_URL}/habits/${params.id}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          user: user.id,
          team:teamValue,
          color: selectedColor,
          name: habitName,
          icon:habitIcon,  
          frequency: frequency,
          description: description,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate ? endDate.toISOString().split('T')[0] : null,
          reminder_time: setReminder ? reminderTime : null,
          specific_days_of_week: specificDaysString,
          specific_day_of_month:specificMonthDayString
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit");
      }
      const data = await response.json();
      resetModalState();
      setRefresh({ refreshHabits: true, refreshList: false,refreshSummary:true ,refreshNotes:false});
      await cancelAllHabitNotifications(data.habitidentifier)
        const daysString = data.specific_days_of_week
        if (setReminder) {
          const notificationId = await schedulePushNotification(
            habitName,
            description, 
            reminderTime,
            daysString ? daysString.split(',') : [],
            data.habitidentifier,
            data.frequency,
            data.specific_day_of_month


          );}
      router.push('/habits');
    } catch (error) {
      //("Error updating habit:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const renderFrequencyButtons = () => {
    return (
      <View style={styles.frequencyContainer}>
        {FREQUENCY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.frequencyButton, { backgroundColor: frequency === option ? 'black' : 'gray' }]}
            onPress={() => handleFrequencyPress(option)}>
            <Text style={styles.frequencyButtonText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleDayPress = (day) => {
    setSelectedDays((prevSelectedDays) => {
      if (prevSelectedDays.includes(day)) {
                return prevSelectedDays.filter((selectedDay) => selectedDay !== day);
      } else {
                return [...prevSelectedDays, day];
      }
    });
  };
  
  const renderDaysOfWeekButtons = () => {
    if (frequency === 'weekly') {
      return (
        <View>
          <Text style={styles.label}>{i18n.t('editHabit.selectDays')} </Text>
          <View style={styles.daysOfWeekContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, { backgroundColor: selectedDays.includes(day) ? 'black' : 'gray' }]}
                onPress={() => handleDayPress(day)}
              >
                <Text style={styles.dayButtonText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    return null;
  };

  const showDatePicker = (picker) => {
    switch (picker) {
      case 'start':
        setStartDatePickerVisible(true);
        break;
      case 'end':
        setEndDatePickerVisible(true);
        break;
      case 'reminder':
        setReminderTimePickerVisible(true);
        break;
      default:
        break;
    }
  };

  const hideDatePicker = (picker) => {
    switch (picker) {
      case 'start':
        setStartDatePickerVisible(false);
        break;
      case 'end':
        setEndDatePickerVisible(false);
        break;
      case 'reminder':
        setReminderTimePickerVisible(false);
        break;
      default:
        break;
    }
  };
  const handleDateConfirm = (picker, date) => {
    switch (picker) {
      case 'start':
        setStartDate(date);
        break;
      case 'end':
        setEndDate(date);
        break;
      case 'reminder':
        setReminderTime(date);
        break;
      default:
        break;
    }
    hideDatePicker(picker);
  };

  return (
    <SafeAreaView>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerTintColor: 'black',
          headerTitle: params && params.mood === 'update' ? i18n.t('editHabit.updateTitle') : i18n.t('editHabit.addTitle'),
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('editHabit.namePlaceholder')}
            value={habitName}
            onChangeText={(text) => 
              {setHabitName(text);
              setHabitNameError('')}
            }
          />
          {habitNameError ? <Text style={styles.errorText}>{habitNameError}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder={i18n.t('editHabit.descriptionPlaceholder')}
            value={description}
            onChangeText={(text) => setDescription(text)}
          />
          {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
          <Text style={styles.label}>{i18n.t('editHabit.selectColor.title')}</Text>
          <View style={{ flexDirection: 'row', marginVertical: 20 ,flexWrap:'wrap',gap:5}}>
            {colorOptions.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius:15,
                  backgroundColor: color,
                  borderColor: color === selectedColor ? 'black' : 'transparent',
                  borderWidth: 2,
                  marginHorizontal: 5,
                }}
                onPress={() => {
                  handleColorSelect(color);
                  setSelectedColorError('');}}
              />
            ))}
          </View>
        {selectedColorError ? <Text style={styles.errorText}>{selectedColorError}</Text> : null}
          <Text style={styles.label}>{i18n.t('editHabit.selectIcon.title')}</Text>
          <TouchableOpacity  style={{ justifyContent:'center',alignItems:'center', marginBottom: 20,width:60,height:60,backgroundColor:'whitesmoke',borderRadius:10 }} onPress={() => setIconModalShow(true)}> 
              <MyHabitIcon iconName={habitIcon} size={25} />
          </TouchableOpacity>
          <Text style={styles.label}>{i18n.t('editHabit.startDate')}</Text>
          <TouchableOpacity onPress={() => showDatePicker('start')}>
            <Text style={styles.input}>{startDate.toISOString().split('T')[0]}</Text>
          </TouchableOpacity>

          <DatePickerModal
            isVisible={isStartDatePickerVisible}
            date={startDate}
            onConfirm={(date) => handleDateConfirm('start', date)}
            onCancel={() => hideDatePicker('start')}
            mode="date"
          />
          <Text style={styles.label}>{i18n.t('editHabit.endDate')}:</Text>
          <TouchableOpacity onPress={() => showDatePicker('end')}>
            <Text style={styles.input}>{endDate ? endDate.toISOString().split('T')[0] : ''}</Text>
          </TouchableOpacity>
          <DatePickerModal
            isVisible={isEndDatePickerVisible}
            date={endDate}
            onConfirm={(date) => handleDateConfirm('end', date)}
            onCancel={() => hideDatePicker('end')}
            mode="date"
          />
          <View style={styles.reminderContainer}>
            <Text style={styles.label}>{i18n.t('editHabit.reminder')} :</Text>
            <Switch value={setReminder} trackColor={{ false: 'grey', true: 'black' }}onValueChange={(value) => setSetReminder(value)} />
          </View>
          { !user.notify && <Text style={{ fontSize: 14, color: 'grey', marginBottom: 20 }}> Turn on Notification to get Habit Reminder</Text>}

          {setReminder && (
            <View>
              <TouchableOpacity onPress={() => showDatePicker('reminder')}>
                <Text style={styles.input}>{reminderTime ? reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
              </TouchableOpacity>
              <DatePickerModal
                isVisible={isReminderTimePickerVisible}
                date={reminderTime}
                onConfirm={(date) => handleDateConfirm('reminder', date)}
                onCancel={() => hideDatePicker('reminder')}
                mode="time"
              />
            </View>
          )}
          <Text style={styles.label}>{i18n.t('editHabit.frequency')}:</Text>
          {renderFrequencyButtons()}
          {renderDaysOfWeekButtons()}
          {renderDayOfMonthPicker()}
          {user.hasTeam ? (
            <View style={styles.reminderContainer}>
              <Text style={styles.label}>{i18n.t('editHabit.sharepartner')} </Text>
              <Switch
                      value={isshared}
                      onValueChange={handleSwitchChange}
                      trackColor={{ false: 'grey', true: 'black' }}
                      />
               </View>
                  ) : (
                    <View>
                      <View style={styles.reminderContainer}>
                        <Text style={styles.label}>{i18n.t('editHabit.sharepartner')}</Text>
                        <Switch
                            value={isshared}
                            onValueChange={handleSwitchChange}
                            trackColor={{ false:'white', true: 'black' }} 
                            disabled={!user.hasTeam}
                            />
                        </View>

            
                          <Text style={{ fontSize: 14, color: 'grey', marginBottom: 20 }}>
                        {i18n.t('editHabit.sharepartnerText')} 
                      </Text>
                    </View>
                  )}
        </View>
        <HabitIconModal isVisible= {iconModalShow}  onClose={()=> setIconModalShow(false)} icon={habitIcon} confirmSelection={(value)=> {{setHabitIcon(value)} setIconModalShow(false)}} i18n={i18n}/>
      </ScrollView>
      <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.createButton,
          {
            backgroundColor: params && params.mood === 'update' ? 'black' : selectedColor ? selectedColor : 'black',
          },
        ]}
        onPress={params && params.mood === 'update' ? handleUpdateHabit : handleCreateHabit}
      >
        <Text style={styles.createButtonText}>
          {params && params.mood === 'update' ? i18n.t('editHabit.updateTitle') : i18n.t('editHabit.addTitle')}
        </Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    justifyContent: 'flex-end',
    backgroundColor: 'white'
  },

  modalContainer: {
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingBottom: 50,
    marginBottom:80,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'whitesmoke',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap:10
  },
  createButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 15,
  
  },
  createButtonText: {
    color: 'white',
    fontWeight:'bold'
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
    marginBottom: 30
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  dayButtonText: {
    color: 'white',
  },
  frequencyContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
    marginBottom: 30
  },
  frequencyButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  frequencyButtonText: {
    color: 'white',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom:15
  },
  buttonContainer: {
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    borderTopWidth: 0,
    borderTopColor: '#ccc',
    padding: 20,
  },
  daysOfMonthContainer:{
    flexDirection:'row',
    gap:10,
    flexWrap:'wrap'
  },
  dayOfMonthCheckbox:{
    padding:10,    
    borderRadius: 5,

  },
  dayOfMonthText:{
    color:'white'
  }
});

export default HabitModal;
