import { useCallback, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { fetchData as fetchUserPlaces, updateUserplaces } from './http.js';
import Error from './components/Error.jsx';
import { useFetch } from './hooks/useFetch.js';

function App() {
  const selectedPlace = useRef();

  const {
    data: userPlaces,
    setData: setUserPlaces,
    isFetching,
    error,
  } = useFetch(fetchUserPlaces, 'user-places', []);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState(false);
  const [IsOpenModal, setIsOpenModal] = useState(false);

  function handleStartRemovePlace(id) {
    setIsOpenModal(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setIsOpenModal(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }

      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      if (!userPlaces.some((place) => place.id === selectedPlace.id)) {
        await updateUserplaces([selectedPlace, ...userPlaces]);
      }
    } catch (err) {
      setErrorUpdatingPlaces({
        message: err.message || 'Failed to update places.',
      });
      setUserPlaces(userPlaces);
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id,
        ),
      );
      setIsOpenModal(false);

      try {
        await updateUserplaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id),
        );
      } catch (err) {
        setErrorUpdatingPlaces({
          message: err.message || 'Failed to delete the place.',
        });
        setUserPlaces(userPlaces);
      }
    },
    [userPlaces, setUserPlaces],
  );

  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      {
        <Modal open={errorUpdatingPlaces} onClose={handleError}>
          {errorUpdatingPlaces && (
            <Error
              title="An error occurred!"
              message={errorUpdatingPlaces.message}
              onConfirm={handleError}
            />
          )}
        </Modal>
      }
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
        {error && <Error title="An error occurred!" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            isLoading={isFetching}
            loadingText="Fetching your places..."
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}
        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
