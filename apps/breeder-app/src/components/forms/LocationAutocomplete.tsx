'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input, Spin } from 'antd';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { LoadScript } from '@react-google-maps/api';

interface LocationAutocompleteProps {
  value?: string;
  onChange?: (value: string, details?: any) => void;
  placeholder?: string;
  disabled?: boolean;
  prefix?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const libraries: any = ['places'];

const LocationAutocompleteInner: React.FC<LocationAutocompleteProps> = ({
  value = '',
  onChange,
  placeholder = 'City, State or general area',
  disabled = false,
  prefix = <EnvironmentOutlined />,
  style,
  className,
}) => {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(cities)'],
    },
    debounce: 300,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync with external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setValue(value, false);
    }
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSelect = async (description: string, placeId: string) => {
    setValue(description, false);
    clearSuggestions();
    setShowSuggestions(false);
    setSelectedIndex(-1);

    try {
      const results = await getGeocode({ placeId });
      const { lat, lng } = await getLatLng(results[0]);
      
      // Extract city and state from address components
      let city = '';
      let state = '';
      let country = '';

      results[0].address_components.forEach((component: any) => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
        if (component.types.includes('country')) {
          country = component.short_name;
        }
      });

      // Format as "City, State" or use the full description
      const formattedAddress = city && state 
        ? `${city}, ${state}${country && country !== 'US' ? ', ' + country : ''}`
        : description;

      onChange?.(formattedAddress, {
        lat,
        lng,
        city,
        state,
        country,
        fullAddress: description,
      });
    } catch (error) {
      console.error('Error fetching place details:', error);
      onChange?.(description);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || data.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && data[selectedIndex]) {
          const { description, place_id } = data[selectedIndex];
          handleSelect(description, place_id);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', ...style }} className={className}>
      <Input
        value={inputValue}
        onChange={handleInput}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        prefix={prefix}
        disabled={disabled || !ready}
        suffix={!ready ? <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} /> : null}
      />

      {showSuggestions && status === 'OK' && data.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          {data.map((suggestion, index) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
              description,
            } = suggestion;

            return (
              <div
                key={place_id}
                onClick={() => handleSelect(description, place_id)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < data.length - 1 ? '1px solid #f0f0f0' : 'none',
                  backgroundColor: selectedIndex === index ? '#f5f5f5' : '#fff',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ fontWeight: 500, color: '#262626' }}>{main_text}</div>
                {secondary_text && (
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
                    {secondary_text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = (props) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. LocationAutocomplete will use a fallback input.');
    return (
      <Input
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value)}
        placeholder={props.placeholder || 'City, State or general area'}
        prefix={props.prefix || <EnvironmentOutlined />}
        disabled={props.disabled}
        style={props.style}
        className={props.className}
      />
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <LocationAutocompleteInner {...props} />
    </LoadScript>
  );
};

export default LocationAutocomplete;

