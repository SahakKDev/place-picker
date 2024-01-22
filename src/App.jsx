import { useCallback, useEffect, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';
import AvailablePlaces from './components/AvailablePlaces.jsx';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);

  const [IsOpenModal, setIsOpenModal] = useState(false);

  function handleStartRemovePlace(id) {
    setIsOpenModal(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setIsOpenModal(false);
  }

  function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }

      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }

      return [selectedPlace, ...prevPickedPlaces];
    });
  }

  const handleRemovePlace = useCallback(function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id),
    );
    setIsOpenModal(false);
  }, []);

  return (
    <>
      <Modal open={IsOpenModal} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
