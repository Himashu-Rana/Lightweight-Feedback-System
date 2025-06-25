import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Chip
} from '@mui/material';

// Predefined tags for feedback
const predefinedTags = [
  'Communication',
  'Technical Skills',
  'Leadership',
  'Teamwork',
  'Problem Solving',
  'Creativity',
  'Time Management',
  'Proactive',
  'Attention to Detail',
  'Customer Focus'
];

const TagSelector = ({ value, onChange, label, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleChange = (event, newValue) => {
    // Ensure we don't have duplicate tags
    const uniqueTags = Array.from(new Set(newValue.map(tag => 
      typeof tag === 'string' ? tag : tag
    )));
    onChange(uniqueTags);
  };
  
  return (
    <Autocomplete
      multiple
      freeSolo
      options={predefinedTags}
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option}
            {...getTagProps({ index })}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          placeholder={placeholder}
          fullWidth
        />
      )}
    />
  );
};

export default TagSelector;