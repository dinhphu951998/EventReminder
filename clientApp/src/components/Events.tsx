import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
} from "semantic-ui-react";

import { deleteEvent, getEvents } from "../api/events-api";
import { Event } from "../types/Event";
import { UserContext } from "context/UserContext";
import { Link, useHistory } from "react-router-dom";

export const Events = () => {
  const userContext = useContext(UserContext);
  const history = useHistory();

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    async function loadEventsAsync() {
      try {
        if (userContext.idToken) {
          setLoadingEvents(true);
          const events = await getEvents(userContext.idToken);
          setEvents(events);
          setLoadingEvents(false);
        }
      } catch (e) {
        alert(`Failed to fetch events: ${(e as Error).message}`);
      }
    }

    loadEventsAsync();
  }, [userContext.idToken]);

  const onEditButtonClick = (eventId: string) => {
    history.push(`/events/${eventId}/edit`);
  };

  const onEventDelete = async (eventId: string) => {
    try {
      setEvents(events.filter((event) => event.id !== eventId));
      await deleteEvent(userContext.idToken, eventId);
    } catch {
      alert("Event deletion failed");
    }
  };

  const renderLoading = () => (
    <Grid.Row>
      <Loader indeterminate active inline="centered">
        Loading Events
      </Loader>
    </Grid.Row>
  );

  const renderEventsList = () => {
    if ((!events || !events.length) && !loadingEvents) {
      return <h2>No events available</h2>;
    }

    return (
      <Grid padded divided="vertically">
        <Grid.Row>
          <Grid.Column width={4}>
            <h4>Title</h4>
          </Grid.Column>
          <Grid.Column width={3}>
            <h4>Start Date</h4>
          </Grid.Column>
          <Grid.Column width={5}>
            <h4>Note</h4>
          </Grid.Column>
        </Grid.Row>
        {events &&
          events.map((event) => {
            return (
              <Grid.Row key={event.id}>
                <Grid.Column width={4}>{event.title}</Grid.Column>
                <Grid.Column width={3}>{event.startDate}</Grid.Column>
                <Grid.Column width={5}>{event.note}</Grid.Column>
                <Grid.Column width={2} floated="right">
                  <div>
                    <Button
                      icon
                      color="blue"
                      onClick={() => onEditButtonClick(event.id)}
                    >
                      <Icon name="pencil" />
                    </Button>
                    <Button
                      icon
                      color="red"
                      onClick={() => onEventDelete(event.id)}
                    >
                      <Icon name="delete" />
                    </Button>
                  </div>
                </Grid.Column>
                {event.imageUrl && (
                  <Image src={event.imageUrl} size="small" wrapped />
                )}
              </Grid.Row>
            );
          })}
      </Grid>
    );
  };

  return (
    <div>
      <Header as="h1">Events</Header>

      <Link to="/events/newEvent">Create new event</Link>
      <Divider />

      {loadingEvents ? renderLoading() : renderEventsList()}
    </div>
  );
};
