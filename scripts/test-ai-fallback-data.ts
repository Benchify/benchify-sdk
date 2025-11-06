export const TestAIFallbackFiles = [
  {
    path: 'src/components/ComplexComponent.tsx',
    contents: `import React from 'react';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  profile: UserProfile;
}

// Missing UserProfile interface

interface Props {
  users: User[];
  onSelect: (user) => void;  // Missing type annotation
  config?: any;  // Using any type
}

const ComplexComponent: React.FC<Props> = ({ users, onSelect, config }) => {
  const [selectedUser, setSelectedUser] = useState();  // Missing type
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);  // Missing type
  
  // Function with implicit any
  const processData = (input) => {
    return input.map(item => {
      // Complex logic with missing types
      const result = item.value * 2;
      return {
        ...item,
        processed: result,
        metadata: getMetadata(item)  // Function doesn't exist
      };
    });
  };
  
  useEffect(() => {
    // Async function without proper typing
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/data');
        const json = await response.json();
        setData(processData(json));
      } catch (error) {
        console.error('Error:', error);
        // Missing error handling
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);  // Missing dependency
  
  // Event handler with implicit any
  const handleClick = (event) => {
    const target = event.target;
    if (target.dataset.userId) {
      const user = users.find(u => u.id === parseInt(target.dataset.userId));
      if (user) {
        onSelect(user);
        setSelectedUser(user);
      }
    }
  };
  
  // Missing return type
  const renderUser = (user) => (
    <div 
      key={user.id} 
      data-user-id={user.id}
      onClick={handleClick}
      className="user-card"
    >
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {/* Accessing potentially undefined property */}
      <span>{user.profile.avatar}</span>
      <span>{user.profile.bio}</span>
    </div>
  );
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="complex-component">
      <h2>Users</h2>
      {/* Using untyped data */}
      <div>Data count: {data.length}</div>
      {users.map(renderUser)}
      {selectedUser && (
        <div className="selected">
          Selected: {selectedUser.name}
        </div>
      )}
    </div>
  );
};

export default ComplexComponent;

// Additional complex code with issues
export function helperFunction(param1, param2) {
  // Missing parameter types and return type
  const result = param1 + param2;
  return result;
}

export const utilityFunction = (data) => {
  // Complex logic with missing types
  return data.reduce((acc, item) => {
    if (item.type === 'special') {
      acc.special.push(item);
    } else {
      acc.regular.push(item);
    }
    return acc;
  }, { special: [], regular: [] });
};`,
  },
];

export const TestAIFallbackDiagnostics = {
  file_to_diagnostics: {
    'src/components/ComplexComponent.tsx': [
      {
        code: 2304,
        context: null,
        file_path: 'src/components/ComplexComponent.tsx',
        location: {
          column: 12,
          line: 8,
          span: 1,
          starting_character_position: 148,
        },
        message: "Cannot find name 'UserProfile'.",
        type: 'dependency',
      },
      {
        code: 2304,
        context: null,
        file_path: 'src/components/ComplexComponent.tsx',
        location: {
          column: 19,
          line: 32,
          span: 1,
          starting_character_position: 838,
        },
        message: "Cannot find name 'getMetadata'.",
        type: 'dependency',
      },
      {
        code: 2345,
        context: null,
        file_path: 'src/components/ComplexComponent.tsx',
        location: {
          column: 25,
          line: 63,
          span: 1,
          starting_character_position: 1673,
        },
        message:
          "Argument of type 'User' is not assignable to parameter of type 'SetStateAction<undefined>'.",
        type: 'type_error',
      },
      {
        code: 2339,
        context: null,
        file_path: 'src/components/ComplexComponent.tsx',
        location: {
          column: 35,
          line: 96,
          span: 1,
          starting_character_position: 2418,
        },
        message: "Property 'name' does not exist on type 'never'.",
        type: 'type_error',
      },
    ],
  },
};

export const TestAIFallbackConfig = {
  template_path: 'benchify/default-template',
  event_id: 'test-ai-fallback-complex-001',
  max_attempts: 3,
  include_context: true,
};
