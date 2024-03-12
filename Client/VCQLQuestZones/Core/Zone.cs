using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using EFT;
using EFT.UI;
using EFT.Interactive;

namespace VCQLQuestZones.Core
{
    internal class Zone
    {
        public string ZoneId { get; set; }
        public string ZoneName { get; set; }
        public string ZoneLocation { get; set; }
        public string ZoneType { get; set; }
        public string FlareType { get; set; }
        public ZoneTransform Position { get; set; }
        public ZoneTransform Rotation { get; set; }
        public ZoneTransform Scale { get; set; }
    }

    internal class ZoneTransform
    {
        public string X { get; set; }
        public string Y { get; set; }
        public string Z { get; set; }

        public ZoneTransform(string x, string y, string z)
        {
            this.X = x; 
            this.Y = y;
            this.Z = z;
        }
    }

    public class ZoneFlareTrigger : TriggerWithId
    {
        public int _experience;

        void Awake()
        {
            gameObject.layer = LayerMask.NameToLayer("Triggers");
        }
        public override void TriggerEnter(Player player)
        {
            base.TriggerEnter(player);
#if DEBUG
            ConsoleScreen.Log("VCQL: Entered Flare Zone.");
#endif
        }
    }
}
